"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadRuntime() {
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
  for (const file of ["agent-core.js", "skills.plan.js", "skills.evidence.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
  }
  return window;
}

test("evidence audit routes to evidence-coach", async () => {
  const window = loadRuntime();
  const state = {
    evidence: [
      { title: "校园二手平台", type: "项目", role: "产品负责人", result: "1,200 注册用户", metrics: ["1,200 注册用户"], skills: ["用户研究"], confidence: 84 },
      { title: "课程研究", type: "课程项目", role: "成员", result: "", metrics: [], skills: ["数据分析"], confidence: 58 },
    ],
    profile: {},
  };
  const result = await window.CareerAgent.orchestrator.handle("审计我的证据库", {
    state,
    generatePlan: () => ({ tasks: [], focus: "业务结果" }),
  });
  assert.equal(result.skillId, "evidence-coach");
  assert.match(result.text, /2 条证据/);
  assert.match(result.text, /1 条证据缺少可验证指标/);
});

test("explicit evidence plan remains owned by evidence-coach", async () => {
  const window = loadRuntime();
  const state = { evidence: [], profile: {} };
  const result = await window.CareerAgent.orchestrator.handle("帮我制定补证计划", {
    state,
    generatePlan: () => ({ tasks: [], focus: "业务结果" }),
  });
  assert.equal(result.skillId, "evidence-coach");
});
