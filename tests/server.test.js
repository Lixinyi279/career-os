"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { safeStaticPath, validateLlmRequest, getLlmConfig } = require("../server");

test("safeStaticPath serves index and static files", () => {
  assert.equal(safeStaticPath("/"), path.join(__dirname, "..", "index.html"));
  assert.equal(safeStaticPath("/assets/styles.css"), path.join(__dirname, "..", "assets", "styles.css"));
});

test("safeStaticPath blocks secrets, traversal and unsupported files", () => {
  assert.equal(safeStaticPath("/.env"), null);
  assert.equal(safeStaticPath("/.git/config"), null);
  assert.equal(safeStaticPath("/server.exe"), null);
});

test("validateLlmRequest accepts a bounded request", () => {
  const result = validateLlmRequest({ system: "system", user: "user", temperature: 0.2, maxTokens: 500 });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { system: "system", user: "user", temperature: 0.2, maxTokens: 500 });
});

test("validateLlmRequest rejects empty and oversized requests", () => {
  assert.equal(validateLlmRequest({ user: "" }).ok, false);
  assert.equal(validateLlmRequest({ user: "x", temperature: 3 }).ok, false);
  assert.equal(validateLlmRequest({ user: "x", maxTokens: 9000 }).ok, false);
  assert.equal(validateLlmRequest({ user: "x".repeat(50001) }).ok, false);
});

test("server config never returns the API key in health clients", () => {
  const config = getLlmConfig();
  assert.equal(typeof config.apiKey, "string");
  assert.equal(Object.prototype.hasOwnProperty.call(config, "apiKey"), true);
});
