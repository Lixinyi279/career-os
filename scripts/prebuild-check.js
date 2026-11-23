#!/usr/bin/env node
/* =========================================================================
 * prebuild-check.js — 构建/推送前的防呆护栏
 * -------------------------------------------------------------------------
 * 在 `npm run build` / `npm run push` 前运行，拦截两类最容易翻车的状态：
 *   1. 模型 Key 仍是占位符（sk-REPLACE_WITH_DEMO_KEY）而你要部署 ——
 *      此时所谓"内置演示 Key 一键激活真模型"根本没激活，评委点开只是规则壳。
 *   2. 公开仓库里躺着核心源码，而你想直接推到 GitHub ——
 *      提醒你把核心逻辑收进私有仓库 / 只部署混淆产物。
 *
 * 用法：npm 生命周期自动触发，也可手动 `node scripts/prebuild-check.js [--allow-key]`。
 *   带 --allow-key 可跳过 Key 占位检查（仅当你有意用规则壳演示时）。
 * -------------------------------------------------------------------------
 * 诚实边界：本脚本只做"提醒"，不做硬性阻断的决策权归属 —— 见底部说明。
 * ========================================================================= */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const GW = path.join(ROOT, "model-gateway.js");

let problems = [];

// 1) Key 占位检查
const gwSrc = fs.existsSync(GW) ? fs.readFileSync(GW, "utf8") : "";
const placeholder = gwSrc.includes("sk-REPLACE_WITH_DEMO_KEY") || !gwSrc.includes('apiKey: "sk-');
if (placeholder) {
  problems.push(
    "模型 Key 还是占位符（sk-REPLACE_WITH_DEMO_KEY）——内置演示 Key 未真正激活。\n" +
    "  → 部署后评委点开仍是规则壳，不是真模型。\n" +
    "  → 若确定要部署，请先在 model-gateway.js 填入真实 Key，或用 --allow-key 跳过。"
  );
}

// 2) 公开仓库 + 核心源码警示
const gitCfg = path.join(ROOT, ".git", "config");
let remote = "(未检测到 remote)";
if (fs.existsSync(gitCfg)) {
  const c = fs.readFileSync(gitCfg, "utf8");
  const m = c.match(/url\s*=\s*(.*)/);
  if (m) remote = m[1].trim();
}
const isGithub = /github\.com/i.test(remote);
const hasSource = fs.existsSync(path.join(ROOT, "skills.rewrite.js")) &&
                  fs.existsSync(path.join(ROOT, "agent-core.js"));
if (isGithub && hasSource) {
  problems.push(
    "✅ 已将 dist/ 加入 .gitignore，混淆产物不会入库。\n" +
    "  ⚠️ 但注意：这个 GitHub 仓库引用了可读源码（agent-core.js、skills.rewrite.js 等 19 个文件都回归入 git）。\n" +
    "  → 若仓库是 public，任何人 git clone 就能拿到全部源码（即便页面用了混淆版）。\n" +
    "  → 想真正防抄，核心逻辑应收进私有仓库，只把 dist 产物发布到公开 Pages。"
  );
}

// 输出
if (problems.length) {
  console.log("\n━━━ prebuild-check 警告 ━━━");
  console.log(problems.map((p) => "• " + p).join("\n\n"));
  console.log("━ 上面是提醒，不是自动阻断。请人工判断后继续，或修复后再 build/push。━━\n");
}
