"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function makeElement() {
  return {
    textContent: "", innerHTML: "", value: "", disabled: false,
    scrollTop: 0, scrollHeight: 0,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    focus() {}, setAttribute() {}, getAttribute() { return null; },
    remove() {}, appendChild() {}, querySelector() { return makeElement(); }, querySelectorAll() { return []; }
  };
}

function storage(initial) {
  const data = new Map(Object.entries(initial || {}));
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

function loadApp(storedState) {
  const nodes = new Map();
  const getNode = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, makeElement());
    return nodes.get(selector);
  };
  const local = storage(storedState ? { "career-os-state-v1": JSON.stringify(storedState) } : {});
  const session = storage();
  const document = {
    querySelector: getNode,
    querySelectorAll: () => [],
    addEventListener() {},
    createElement: () => makeElement(),
    body: { classList: { add() {}, remove() {}, toggle() {} } },
  };
  const window = {
    location: { protocol: "file:" },
    localStorage: local,
    sessionStorage: session,
    setTimeout: () => 0,
    addEventListener() {},
    requestAnimationFrame: () => 0,
    confirm: () => true,
  };
  window.window = window;
  window.document = document;
  const context = {
    window, document, console,
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    setTimeout: () => 0,
    clearTimeout: () => {},
    URL, AbortController, Blob: class {}, FormData: class {}, HTMLFormElement: class {}, Element: class {},
    Math, Date, JSON, Map, Set, Object, Array, String, Number, Boolean, RegExp, Intl, Promise, Error,
  };
  vm.createContext(context);
  for (const file of ["agent-core.js", "model-gateway.js", "skills.career.js", "skills.resume.js", "skills.interview.js", "skills.plan.js", "skills.rewrite.js", "skills.star.js", "skills.pipeline.js", "skills.evidence.js", "app.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
  }
  return { window, getNode };
}

test("new users see the onboarding call to action", () => {
  const { window, getNode } = loadApp(null);
  assert.equal(window.CareerOS.version, "0.5.0");
  assert.equal(window.CareerOS.state.onboardingComplete, false);
  assert.match(getNode("#main-content").innerHTML, /第一次使用/);
  assert.match(getNode("#main-content").innerHTML, /data-action="start-onboarding"/);
});

test("legacy local state is migrated without forcing onboarding", () => {
  const { window, getNode } = loadApp({ version: 2, profile: { name: "Existing User" }, tasks: [] });
  assert.equal(window.CareerOS.state.onboardingComplete, true);
  assert.equal(getNode("#main-content").innerHTML.includes("第一次使用"), false);
});
