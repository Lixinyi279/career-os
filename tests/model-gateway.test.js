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

test("demo key is only active in a real page host, not in bare vm", () => {
  // 无 hostname（vm 测试环境）→ demoConfig 不应激活，避免干扰 rules 模式测试
  const { api } = loadGateway(async () => jsonResponse(200, { choices: [{ message: { content: "OK" } }] }));
  const cfg = api.getConfig();
  assert.equal(cfg.apiKey, undefined);
});

test("direct mode budget guard blocks after daily/session limit", async () => {
  const usage = { prompt_tokens: 500000, completion_tokens: 125000, prompt_cache_hit_tokens: 100000 };
  // 成本 = (400000*2 + 125000*8)/1e6 = 1.8 元，单次就超过 sessionLimit(1元)
  let calls = 0;
  let completionCalls = 0;
  const { api, localStorage } = loadGateway(async (url) => {
    calls += 1;
    if (url === "/api/health") return jsonResponse(200, { llm: { configured: false, mode: "rules" } });
    completionCalls += 1;
    return jsonResponse(200, { choices: [{ message: { content: "OK" }, finish_reason: "stop" }], model: "m", usage });
  });
  api.saveConfig({ preset: "deepseek", apiKey: "real-secret", baseUrl: "https://example.test/v1", model: "test-model" });
  const adapter = api.createLlmAdapter();
  // 第一次请求会记账（1.8 元 > 会话 1 元），第二次应在发请求前被拦截
  const first = await adapter.complete({ user: "hi" });
  assert.equal(first.text, "OK");
  assert.ok(localStorage.getItem("career-os.direct-budget").includes("sessionYuan"));
  await assert.rejects(() => adapter.complete({ user: "again" }), /LLM_BUDGET_EXCEEDED/);
  assert.equal(completionCalls, 1); // 第二次被拦截，未发出 completion 网络请求
});
