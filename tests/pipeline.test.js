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
  for (const file of ["agent-core.js", "skills.plan.js", "skills.pipeline.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
  }
  return window;
}

test("application feedback routes to pipeline-review before plan-builder", async () => {
  const window = loadRuntime();
  const state = {
    applications: [
      { company: "云帆科技", role: "产品运营", stage: "interview", nextAction: "准备二面", nextAt: "2026-11-04", feedback: "一面通过" },
    ],
    profile: {},
  };
  const result = await window.CareerAgent.orchestrator.handle("帮我复盘投递和反馈", {
    state,
    generatePlan: () => ({ tasks: [], focus: "业务结果" }),
  });
  assert.equal(result.skillId, "pipeline-review");
  assert.match(result.text, /云帆科技/);
  assert.match(result.text, /一面通过/);
});

test("weekly planning still handles explicit plan requests with application context", async () => {
  const window = loadRuntime();
  const state = { applications: [], profile: { weeklyHours: 10 }, tasks: [] };
  const result = await window.CareerAgent.orchestrator.handle("根据投递反馈调整本周计划", {
    state,
    generatePlan: () => ({ tasks: [{ id: "t1", title: "复盘", detail: "复盘", category: "review", duration: 20, day: "今天", priority: "P0" }], focus: "业务结果" }),
  });
  assert.equal(result.skillId, "plan-builder");
});
