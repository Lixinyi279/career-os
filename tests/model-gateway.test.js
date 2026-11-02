"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function makeStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

function loadGateway(fetchImpl) {
  const localStorage = makeStorage();
  const sessionStorage = makeStorage();
  const requests = [];
  const window = {
    location: { protocol: "http:" },
    localStorage,
    sessionStorage,
  };
  const context = {
    window,
    fetch: async (url, options) => {
      requests.push({ url, options });
      return fetchImpl(url, options);
    },
    AbortController,
    setTimeout,
    clearTimeout,
    console,
    URL,
  };
  window.window = window;
  vm.createContext(context);
  const source = fs.readFileSync(path.join(__dirname, "..", "model-gateway.js"), "utf8");
  vm.runInContext(source, context, { filename: "model-gateway.js" });
  return { api: window.CareerOS.llm, requests, localStorage, sessionStorage };
}

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
}

test("secure proxy mode sends prompts without browser credentials", async () => {
  const { api, requests } = loadGateway(async (url) => {
    if (url === "/api/health") {
      return jsonResponse(200, { llm: { configured: true, mode: "secure-proxy", model: "server-model" } });
    }
    return jsonResponse(200, { choices: [{ message: { content: "OK" }, finish_reason: "stop" }], model: "server-model", usage: { total_tokens: 2 } });
  });
  await api.refreshServerStatus(true);
  const adapter = api.createLlmAdapter();
  const result = await adapter.complete({ system: "sys", user: "hello", maxTokens: 20 });
  assert.equal(result.text, "OK");
  assert.equal(adapter.mode(), "secure-proxy");
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, "/api/llm/complete");
  assert.equal(requests[1].options.headers.Authorization, undefined);
});

test("rules mode rejects completion and reports configuration status", async () => {
  const { api } = loadGateway(async (url) => {
    if (url === "/api/health") return jsonResponse(200, { llm: { configured: false, mode: "rules" } });
    throw new Error("unexpected completion request");
  });
  await api.refreshServerStatus(true);
  const adapter = api.createLlmAdapter();
  assert.equal(adapter.configured(), false);
  assert.equal(adapter.mode(), "rules");
  await assert.rejects(() => adapter.complete({ user: "hello" }), /LLM_NOT_CONFIGURED/);
});

test("direct API key is session-only and stored separately from durable config", () => {
  const { api, localStorage, sessionStorage } = loadGateway(async () => jsonResponse(500, {}));
  api.saveConfig({ preset: "deepseek", apiKey: "test-secret", baseUrl: "https://example.test/v1", model: "test-model" });
  assert.equal(localStorage.getItem("career-os.llm-config").includes("test-secret"), false);
  assert.equal(sessionStorage.getItem("career-os.llm-config").includes("test-secret"), true);
  assert.equal(api.getConfig().apiKey, "test-secret");
});
