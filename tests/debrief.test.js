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
    window, console,
    performance: { now: () => 0 },
    setTimeout, clearTimeout, AbortController, URL, Date, JSON, Map, Set, Object, Array, String, Number, Boolean, RegExp,
  };
  vm.createContext(context);
  for (const file of ["agent-core.js", "skills.debrief.js", "skills.interview.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
  }
  return window;
}

test("real interview debrief routes to interview-debrief", async () => {
  const window = loadRuntime();
  const state = {
    interviewDebriefs: [
      { company: "云帆科技", role: "产品运营", round: "一面", date: "2026-10-30", outcome: "进入下一轮", selfScore: 64, questions: "如何证明你的数据结论？", improve: "数据归因不清楚", nextAction: "补留存和转化指标" },
    ],
  };
  const result = await window.CareerAgent.orchestrator.handle("复盘我的真实面试", { state });
  assert.equal(result.skillId, "interview-debrief");
  assert.match(result.text, /云帆科技/);
  assert.match(result.text, /64/);
});

test("normal mock interview still routes to mock-interview", async () => {
  const window = loadRuntime();
  const result = await window.CareerAgent.orchestrator.handle("开始一次压力模拟面试", { state: { interviewDebriefs: [] } });
  assert.equal(result.skillId, "mock-interview");
});
