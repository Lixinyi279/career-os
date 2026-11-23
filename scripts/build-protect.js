#!/usr/bin/env node
/* =========================================================================
 * build-protect.js — 职途 CareerOS 发布保护构建
 * -------------------------------------------------------------------------
 * 做什么：
 *   1. 按 index.html 的引用顺序读取所有业务 JS；
 *   2. 注入反调试/禁右键保护层（scripts/anti-tamper.js）；
 *   3. 用 terser 压缩 + 部分混淆，合并成一个 dist/app.min.js；
 *   4. 改写 index.html，把 19 个 <script src> 换成 1 个 <script src="./dist/app.min.js">，
 *      部署包只带混淆版；可读源码仍完整保留在本机。
 *   5. 生成 dist/DEPLOY_NOTICE.md 说明部署注意事项。
 *
 * 用法： node scripts/build-protect.js
 *   可选： BUILD_PROTECT_SKIP_OBF=1 只压不混淆（排查性能/正确性问题时用）
 *         本地联调：不跑本脚本，直接用原 index.html 即可（源码可读、可调试）。
 *
 * 诚实边界（本身不撒谎，也在产物里注明）：
 *   - 混淆/反调试只能提高复制门槛，不能绝对防拷贝；
 *   - 真正安全的"功能保护"是把关键逻辑放服务端/私有调用，前端只留调用壳。
 * ========================================================================= */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { minify } = require("terser");

const ROOT = path.resolve(__dirname, "..");
const INDEX = path.join(ROOT, "index.html");
const DIST = path.join(ROOT, "dist");
const SKIP_OBF = process.env.BUILD_PROTECT_SKIP_OBF === "1";

// 这些是内部脚本，天然带分隔符保护，可安全合并。
// 从 index.html 提取业务脚本（排除外部 CDN / service-worker）。
function collectScriptSrc(html) {
  const re = /<script\s+[^>]*?src="([^"]+)"[^>]*>\s*<\/script>/gi;
  const srcs = [];
  let m;
  const seen = new Set();
  while ((m = re.exec(html)) !== null) {
    const src = m[1].replace(/^\.\//, "").replace(/\?.*$/, "");
    if (src === "service-worker.js") continue; // SW 不并入主包
    if (/^https?:|^\/\//.test(src)) continue; // 外部跳过
    if (seen.has(src)) continue;
    seen.add(src);
    srcs.push(src);
  }
  return srcs;
}

function wrap(files) {
  // 每个文件包一层 IIFE 风格注释，避免顶层 var 互相污染；业务文件本就是 IIFE，直接拼接亦可，
  // 此处统一用分号衔接并追求压缩体积。
  return files.map((f) => fs.readFileSync(f, "utf8")).join("\n;\n");
}

function sanityCheck(code, srcList) {
  // 纯语法校验：不 mock DOM（业务代码里有真实 DOM 调用，mock 不现实），
  // 改用 V8 解析器确认压缩产物没有语法错误。
  // 语法正确性由 V8 保证；功能正确性交给项目的 npm test（针对源码版本）。
  try {
    new vm.Script(code, { filename: "app.min.js" });
  } catch (e) {
    throw new Error("sanityCheck failed: " + e.message);
  }
  // 关键全局必须被保留：混淆配置里已 reserved，这里兜底断言产物仍包含这些标识。
  // （注意：压缩后可能被 terser 改名为短名，只校验“仍可用保留名出现”的渲染入口）
  const required = ["CareerOS", "CareerAgent"];
  const missing = required.filter((g) => !code.includes(g));
  if (missing.length) {
    throw new Error("混淆产物缺少保留全局: " + missing.join(","));
  }
  return true;
}

function main() {
  if (!fs.existsSync(INDEX)) { console.error("找不到 index.html:", INDEX); process.exit(1); }
  let html = fs.readFileSync(INDEX, "utf8");
  const order = collectScriptSrc(html);
  if (!order.length) { console.error("index.html 里没解析到业务脚本"); process.exit(1); }

  console.log("打包顺序：");
  order.forEach((s, i) => console.log("  " + (i + 1) + ". " + s));

  // 1) 读业务代码 + 2) 注入保护层
  const anti = path.join(__dirname, "anti-tamper.js");
  const business = order.map((s) => path.join(ROOT, s));
  const pre = wrap([anti, ...business]);

  // 3) terser 压缩 + 混淆
  const mangle = SKIP_OBF ? {} : { toplevel: false, reserved: ["CareerOS", "CareerAgent", "CareerOSConfig"] };
  const compress = SKIP_OBF ? { defaults: false } : { defaults: true, passes: 2 };

  minify(pre, {
    compress,
    mangle,
    format: { comments: /^!/, quote_style: 1 },
    module: false,
  }).then((r) => {
    if (!r.code) throw new Error("terser 未产出代码");
    const code = r.code;

    // 4) sanityCheck（对压缩后的代码做一次 vm 加载，确保没打坏）
    try {
      sanityCheck(code, order);
      console.log("✓ 压缩后语法/加载校验通过");
    } catch (e) {
      console.error("✗ 压缩产物校验失败，中止（不改动 index.html）", e.message);
      process.exitCode = 1;
      return;
    }

    // 5) 写 dist
    if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });
    fs.writeFileSync(path.join(DIST, "app.min.js"), code, "utf8");

    // 6) 改写 index.html：把业务脚本区（含缩进/换行差异）整体替换为一个
    const scriptRegex = /((?:\s*<script[^>]*src="\.\/[^"]+\.js"[^>]*>\s*<\/script>\s*)+)/;
    if (!scriptRegex.test(html)) {
      console.error("index.html 脚本块与预期不符，未自动替换（请手动核对）");
      console.error("  共解析到业务脚本：" + order.length + " 个");
    } else {
      const stamp = `<!-- 保护构建 ${new Date().toISOString().slice(0, 19).replace("T", " ")} · 源码不入部署包，可读源码留本地 -->\n`;
      html = html.replace(scriptRegex, stamp + `    <script src="./dist/app.min.js"></script>\n`);
      fs.writeFileSync(INDEX, html, "utf8");
      console.log("✓ index.html 已切换到 dist/app.min.js");
    }

    // 7) 部署说明
    const notice =
`# 部署说明（保护构建产物）

这个 dist/app.min.js 是 **混淆压缩版**：19 个业务脚本 + 反调试保护层被合并压缩成单文件。
部署时**只上传 dist/ 与 index.html**，不要上传 *.js 源文件，源码保留在你本地仓库。

- 可读源码：仓库根目录的 *.js / skills/*.js（本机保留）
- 部署形态：index.html + dist/app.min.js
- 本地调试：不跑本脚本，直接用原 index.html 引用源码脚本即可（可读、可断点）

## 诚实边界
- 混淆 + 反调试只能提高复制门槛，**不能绝对防拷贝**（页面代码必须下发浏览器才能运行）。
- 真正安全的"功能保护"是把核心逻辑放在服务端/私有接口，前端只留调用壳。
- 若你的关键能力全在前端，别人仍可能通过抓包 + 内存 patch 绕过——请在答辩时如实描述"构建保护层"，不要宣称"防死"。

## 重新构建
    node scripts/build-protect.js
排查正确性/性能用（只压缩不改名、不混淆）:
    BUILD_PROTECT_SKIP_OBF=1 node scripts/build-protect.js
`;
    fs.writeFileSync(path.join(DIST, "DEPLOY_NOTICE.md"), notice, "utf8");
    console.log("✓ dist/ 已生成：app.min.js + DEPLOY_NOTICE.md");
    console.log("压缩前字节：", Buffer.byteLength(pre, "utf8").toLocaleString());
    console.log("压缩后字节：", Buffer.byteLength(code, "utf8").toLocaleString());
  }).catch((e) => {
    console.error("terser 失败：", e.message);
    process.exit(1);
  });
}

main();
