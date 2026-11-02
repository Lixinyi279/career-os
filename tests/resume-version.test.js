"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function element() {
  return {
    textContent: "", innerHTML: "", value: "", disabled: false,
    scrollTop: 0, scrollHeight: 0,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    focus() {}, setAttribute() {}, getAttribute() { return null; },
    remove() {}, appendChild() {}, querySelector() { return element(); }, querySelectorAll() { return []; }
  };
}

function storage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

function loadApp() {
  const nodes = new Map();
  const getNode = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, element());
    return nodes.get(selector);
  };
  const document = {
    querySelector: getNode,
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => element(),
    body: { classList: { add() {}, remove() {}, toggle() {} } },
  };
  const window = {
    location: { protocol: "file:" },
    localStorage: storage(), sessionStorage: storage(),
    setTimeout: () => 0, addEventListener() {}, requestAnimationFrame: () => 0, confirm: () => true,
  };
  window.window = window;
  window.document = document;
  const context = {
    window, document, console,
    performance: { now: () => 0 }, requestAnimationFrame: () => 0, setTimeout: () => 0, clearTimeout: () => {},
    URL, AbortController, Blob: class {}, FormData: class {}, HTMLFormElement: class {}, Element: class {},
    Math, Date, JSON, Map, Set, Object, Array, String, Number, Boolean, RegExp, Intl, Promise, Error,
  };
  vm.createContext(context);
  for (const file of ["agent-core.js", "model-gateway.js", "job-fit.js", "skills.jobs.js", "skills.career.js", "skills.resume.js", "skills.interview.js", "skills.plan.js", "skills.rewrite.js", "skills.star.js", "skills.pipeline.js", "skills.evidence.js", "app.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
  }
  return { window, getNode };
}

test("resume versions render and the active version receives current edits", () => {
  const { window, getNode } = loadApp();
  const api = window.CareerOS;
  assert.ok(api.state.resumeVersions.length >= 2);
  api.ui.view = "resume";
  api.render();
  assert.match(getNode("#main-content").innerHTML, /resume-version-manager/);
  assert.match(getNode("#main-content").innerHTML, /产品运营主版本/);
  const firstId = api.state.activeResumeVersionId;
  api.state.resume.text += "\n新增真实事实";
  assert.equal(api.syncActiveResumeVersion(), true);
  assert.match(api.state.resumeVersions.find((item) => item.id === firstId).text, /新增真实事实/);
});

test("switching resume versions restores its target JD and score", () => {
  const { window } = loadApp();
  const api = window.CareerOS;
  const target = api.state.resumeVersions.find((item) => item.id !== api.state.activeResumeVersionId);
  api.loadResumeVersion(target.id);
  assert.equal(api.state.activeResumeVersionId, target.id);
  assert.equal(api.state.resume.targetJD, target.targetJD);
  assert.equal(api.state.resume.score, target.score);
});
