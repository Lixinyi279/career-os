"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadJobFit() {
  const window = {};
  const context = { window, console };
  window.window = window;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "job-fit.js"), "utf8"), context, { filename: "job-fit.js" });
  return window.CareerOS.jobFit;
}

test("job fit extracts covered and missing capabilities from evidence", () => {
  const jobFit = loadJobFit();
  const job = { company: "云帆科技", role: "产品运营", jd: "负责用户研究与数据分析，推动用户增长和活动运营，协同产品团队落地。" };
  const evidence = [
    { title: "校园产品", action: "访谈 18 位用户并分析数据", result: "上线", metrics: ["1,200 用户"], skills: ["用户研究", "数据分析"] }
  ];
  const result = jobFit.analyze(job, evidence, { score: 70 });
  assert.ok(result.score >= 55);
  assert.ok(result.matched.includes("用户研究"));
  assert.ok(result.matched.includes("数据分析"));
  assert.ok(result.missing.includes("增长运营"));
  assert.ok(result.nextActions.some((item) => item.includes("增长运营")));
});

test("job analysis routes to job-fit skill", async () => {
  const window = {};
  window.window = window;
  const context = {
    window, console, performance: { now: () => 0 }, setTimeout, clearTimeout,
    AbortController, URL, Date, JSON, Map, Set, Object, Array, String, Number, Boolean, RegExp,
  };
  vm.createContext(context);
  for (const file of ["agent-core.js", "skills.jobs.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
  }
  const job = { company: "云帆科技", role: "产品运营", priority: "P0", deadline: "2026-11-10", jd: "用户研究和数据分析" };
  const result = await window.CareerAgent.orchestrator.handle("分析目标岗位 JD", {
    state: { jobTargets: [job], evidence: [{ title: "校园产品", action: "用户访谈和数据分析", metrics: ["100 用户"], skills: ["用户研究"] }], resume: { score: 65 } },
    jobFit: loadJobFit(),
  });
  assert.equal(result.skillId, "job-fit");
  assert.match(result.text, /云帆科技/);
  assert.match(result.text, /匹配度/);
});
