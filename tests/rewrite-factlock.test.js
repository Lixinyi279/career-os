"use strict";

// Fact-Lock 程序化事实校验 · 自动化测试
//
// 目的（对应实施要求 2）：用模拟模型故意返回编造的数字、经历和技能，
// 验证这些内容会被程序化校验器拦截并转追问；同时验证正常改写仍能通过；
// 再验证模型缺失/出错时走降级模式且不展示带虚构数据的示例。

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadRewrite(llmImpl) {
  const window = {};
  window.window = window;
  const context = {
    window,
    console,
    performance: { now: () => 0 },
    setTimeout,
    clearTimeout,
    AbortController,
    URL,
    Date,
    JSON,
    Map,
    Set,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
  };
  vm.createContext(context);
  for (const file of ["agent-core.js", "skills.rewrite.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
  }
  // 暴露校验器供断言直达
  return { window, runtime: context };
}

const RESUME_OK_TEXT = [
  "教育背景：某大学计算机系",
  "实习经历：在 A 公司做过产品助理，负责用户调研，协助日常工作",
  "校园经历：担任学生会宣传部部长",
  "技能：会写代码、会用 Office、会沟通",
  "自我评价：我是一个认真负责的人，学习能力强。"
].join("\n");

// 逐轮驱动的模拟模型：按顺序返回预置文本。
function scriptedLlm(responses) {
  let calls = 0;
  const handler = async () => {
    const idx = Math.min(calls, responses.length - 1);
    const text = responses[idx];
    calls += 1;
    return { text };
  };
  return { complete: handler, callCount: () => calls };
}

test("Fact-Lock 拦截模型编造的假数字并转反问（保留追问、不落事实）", async () => {
  // 原文没有任何用户调研人数：模型偏编「调研 200 名用户」「留存提升 15%」。
  const llm = scriptedLlm([
    "产品助理；用户调研；参与日常工作；学生会宣传部部长",
    "改前：负责用户调研\n改后：通过问卷调研 200 名用户，发现 3 个核心痛点，用户留存提升 15%\n为什么：量化补充",
    "模型认为改写未新增事实（编造了，用于验证程序化拦截独立于模型自检）",
  ]);
  const { window } = loadRewrite(llm);
  const result = await window.CareerAgent.orchestrator.handle("帮我改这段实习经历", {
    state: { resume: { text: RESUME_OK_TEXT } },
    llm: llm,
  });
  assert.equal(result.skillId, "resume-rewrite");
  // 程序化拦截：200 / 3 / 15 在原文件中不存在，必须出现追问，不得作为事实输出。
  assert.match(result.text, /原文中没有/);
  assert.match(result.text, /请你补充对应的真实情况与可验证数据/);
  // 关键：不管模型自检怎么放行，编造数字(200)被改写成追问，而不是作为简历事实保留。
  // 校验信息进入 artifact
  assert.ok(result.artifact.blocked >= 2, "应至少拦截 2 处无依据内容");
  const blockedValues = result.artifact.blockedLines.join("|");
  assert.match(blockedValues, /number:200/);
  assert.match(blockedValues, /number:15/);
});

test("Fact-Lock 拦截编造的公司/平台名（实体校验）", async () => {
  // 原文没有的新增机构与平台实体。
  const llm = scriptedLlm([
    "产品助理；用户调研；学生会宣传部部长",
    "改前：能沟通协作\n改后：曾在某头部互联网公司担任产品助理，负责智能推荐平台的需求跟进，并主导用户增长项目\n为什么：补主体",
    "模型认为是事实（用于验证实体校验独立于模型自检）",
  ]);
  const { window } = loadRewrite(llm);
  const result = await window.CareerAgent.orchestrator.handle("帮我改技能那段", {
    state: { resume: { text: RESUME_OK_TEXT } },
    llm: llm,
  });
  assert.equal(result.skillId, "resume-rewrite");
  assert.match(result.text, /原文中没有/);
  // 原文未出现的机构/平台名（带词尾）必须被拦截为追问，不作为简历事实出现。
  assert.match(result.text, /智能推荐平台/);
  assert.match(result.text, /请你补充对应的真实情况与可验证数据/);
  assert.ok(result.artifact.blocked >= 1, "应至少拦截 1 处无依据机构/平台名");
});

test("正常改写（新增内容均有原文依据）仍能通过", async () => {
  const resume = "运营校园公众号，发布推文 30 篇，单篇最高阅读 5000+。";
  const llm = scriptedLlm([
    "运营校园公众号；推文 30 篇；单篇最高阅读 5000+",
    "改前：运营公众号\n改后：运营校园公众号，累计发布推文 30 篇，单篇最高阅读 5000+\n为什么：保留原文数字",
    "未新增事实",
  ]);
  const { window } = loadRewrite(llm);
  const result = await window.CareerAgent.orchestrator.handle("帮我优化这段", {
    state: { resume: { text: resume } },
    llm: llm,
  });
  assert.equal(result.skillId, "resume-rewrite");
  // 30 / 5000 在原文出现过，属于有依据内容，允许保留。
  assert.match(result.text, /30 篇/);
  assert.match(result.text, /5000\+/);
  assert.equal(result.artifact.blocked, 0);
});

test("模型缺失（LLM_NOT_CONFIGURED）时走规则降级且不含虚构示例", async () => {
  const { window } = loadRewrite(null); // 不提供完整模型
  const result = await window.CareerAgent.orchestrator.handle("帮我改写这段经历", {
    state: { resume: { text: RESUME_OK_TEXT } },
  });
  assert.equal(result.skillId, "resume-rewrite");
  assert.match(result.text, /规则版事实锁提示/);
  assert.match(result.text, /模型暂不可用或未接入/);
  // 降级文案不得再用「发布 30 篇推文 / 单篇最高阅读 5000+」这类虚构示例。
  assert.doesNotMatch(result.text, /30 篇推文/);
  assert.doesNotMatch(result.text, /5000/);
  assert.ok(result.artifact.fallback);
});

test("模型抛错时安全降级且仍能给出可用的规则提示", async () => {
  const throwingLlm = {
    complete: async () => { throw new Error("LLM_TIMEOUT"); },
  };
  const { window } = loadRewrite(throwingLlm);
  const result = await window.CareerAgent.orchestrator.handle("帮我改这段经历", {
    state: { resume: { text: RESUME_OK_TEXT } },
    llm: throwingLlm,
  });
  assert.equal(result.skillId, "resume-rewrite");
  assert.match(result.text, /规则版事实锁提示/);
  assert.match(result.text, /LLM_TIMEOUT/);
});
