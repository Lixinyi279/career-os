(function () {
  "use strict";

  // Model Gateway：把 Skill 的 context.llm.complete 接到模型。
  // 优先使用同源安全代理 /api/llm/complete；静态打开时可选浏览器直连模式。
  // 服务端模式不会把 API Key 暴露给浏览器。

  var STORAGE_KEY = "career-os.llm-config";
  var SERVER_HEALTH_URL = "/api/health";
  var SERVER_COMPLETE_URL = "/api/llm/complete";
  var HEALTH_TTL_MS = 30000;

  // ── 内置演示配置（浏览器直连，零配置激活真模型）────────────────────────────
  // 说明：评委点开页面即自动用此 Key 走 model-gateway 的浏览器直连模式，
  // 任一 Skill 调用 complete() 即命中真实模型。仅在展示场景使用。
  // 安全提示：此 Key 会随静态站点公开，务必使用一次性/低额度 Key，展示后及时下线。
  var DEMO = {
    enabled: true,
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    apiKey: "sk-8533bd65185e470a922aa8f2d20e7de6"
  };

  function demoConfig() {
    // 环境闸门：真实页面（hostname 非空）才激活内置演示 Key；
    // 测试/本地无 hostname 的 vm 环境不激活，保证 rules 模式测试确定性。
    var host = window.location && window.location.hostname;
    if (!host) return null;
    if (!DEMO.enabled || !DEMO.apiKey || DEMO.apiKey.indexOf("sk-REPLACE") === 0) return null;
    return { preset: "deepseek", baseUrl: DEMO.baseUrl, model: DEMO.model, apiKey: DEMO.apiKey };
  }
  var serverStatus = {
    checked: false,
    available: false,
    llmConfigured: false,
    mode: "rules",
    model: null,
    error: null,
    checkedAt: null
  };
  var healthPromise = null;

  var PRESETS = {
    deepseek: {
      label: "DeepSeek（推荐）",
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
      models: [
        { id: "deepseek-chat", label: "DeepSeek-V3（通用对话，推荐）" },
        { id: "deepseek-reasoner", label: "DeepSeek-R1（深度推理，复杂分析更强）" }
      ]
    },
    qwen: {
      label: "通义千问",
      baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      model: "qwen-plus",
      models: [
        { id: "qwen-plus", label: "Qwen-Plus（推荐）" },
        { id: "qwen-max", label: "Qwen-Max（能力最强）" },
        { id: "qwen-turbo", label: "Qwen-Turbo（响应最快）" }
      ]
    },
    doubao: { label: "豆包（火山方舟）", baseUrl: "https://ark.cn-beijing.volces.com/api/v3", model: "", models: [] },
    custom: { label: "自定义（其他 OpenAI 兼容）", baseUrl: "", model: "", models: [] }
  };

  function canReachServer() {
    var protocol = window.location && window.location.protocol;
    return protocol === "http:" || protocol === "https:";
  }

  function readStore(store, key) {
    try { return store ? store.getItem(key) : null; } catch (_error) { return null; }
  }

  function writeStore(store, key, value) {
    try { if (store) store.setItem(key, value); } catch (_error) {}
  }

  function parseConfig(raw) {
    try { return JSON.parse(raw || "{}") || {}; } catch (_error) { return {}; }
  }

  function getConfig() {
    var local = parseConfig(readStore(window.localStorage, STORAGE_KEY));
    var session = parseConfig(readStore(window.sessionStorage, STORAGE_KEY));
    // Migrate legacy keys that were previously stored durably in localStorage.
    if (local.apiKey) {
      session = Object.assign({}, local, session, { apiKey: local.apiKey });
      writeStore(window.sessionStorage, STORAGE_KEY, JSON.stringify(session));
      var safeLocal = Object.assign({}, local);
      delete safeLocal.apiKey;
      writeStore(window.localStorage, STORAGE_KEY, JSON.stringify(safeLocal));
    }
    // 用户手动配置优先；否则回落到内置演示配置（若有）。
    var merged = Object.assign({}, local, session);
    if (!directConfigured(merged)) {
      var demo = demoConfig();
      if (demo) merged = Object.assign({}, demo, merged);
    }
    return merged;
  }

  function saveConfig(config) {
    var normalized = {
      preset: String(config && config.preset || "custom"),
      baseUrl: String(config && config.baseUrl || "").trim(),
      model: String(config && config.model || "").trim()
    };
    writeStore(window.localStorage, STORAGE_KEY, JSON.stringify(normalized));
    var apiKey = String(config && config.apiKey || "").trim();
    if (apiKey) {
      writeStore(window.sessionStorage, STORAGE_KEY, JSON.stringify(Object.assign({}, normalized, { apiKey: apiKey })));
    } else {
      try { window.sessionStorage && window.sessionStorage.removeItem(STORAGE_KEY); } catch (_error) {}
    }
  }

  function directConfigured(config) {
    var c = config || getConfig();
    return Boolean(c.apiKey && c.baseUrl && c.model);
  }

  function withTimeout(ms, externalSignal) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort("timeout"); }, ms);
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort("external");
      else externalSignal.addEventListener("abort", function () { controller.abort("external"); }, { once: true });
    }
    return {
      signal: controller.signal,
      cleanup: function () { clearTimeout(timer); }
    };
  }

  async function fetchJson(url, options, timeoutMs, externalSignal) {
    if (typeof fetch !== "function") throw new Error("LLM_FETCH_UNAVAILABLE");
    var request = withTimeout(timeoutMs, externalSignal);
    try {
      var response = await fetch(url, Object.assign({}, options, { signal: request.signal }));
      var text = await response.text();
      var data = null;
      try { data = text ? JSON.parse(text) : null; } catch (_error) {}
      if (!response.ok) {
        var detail = data && (data.message || data.error) || text.slice(0, 240);
        var error = new Error("LLM_HTTP_" + response.status + (detail ? ": " + detail : ""));
        error.status = response.status;
        error.code = data && data.error || "LLM_HTTP_" + response.status;
        throw error;
      }
      return data || {};
    } catch (error) {
      if (error.name === "AbortError") throw new Error("LLM_TIMEOUT");
      throw error;
    } finally {
      request.cleanup();
    }
  }

  function normalizeResponse(data, fallbackModel) {
    var choice = data && data.choices && data.choices[0];
    return {
      text: choice && choice.message && choice.message.content || "",
      model: data && data.model || fallbackModel || null,
      usage: data && data.usage || null,
      finishReason: choice && choice.finish_reason || null
    };
  }

  async function refreshServerStatus(force) {
    var now = Date.now();
    if (!force && serverStatus.checked && now - serverStatus.checkedAt < HEALTH_TTL_MS) return serverStatus;
    if (!force && healthPromise) return healthPromise;
    if (!canReachServer()) {
      serverStatus = { checked: true, available: false, llmConfigured: false, mode: "rules", model: null, error: null, checkedAt: now };
      return serverStatus;
    }
    healthPromise = (async function () {
      try {
        var data = await fetchJson(SERVER_HEALTH_URL, { headers: { "Accept": "application/json" } }, 3000);
        var llm = data && data.llm || {};
        serverStatus = {
          checked: true,
          available: true,
          llmConfigured: Boolean(llm.configured),
          mode: llm.configured ? "secure-proxy" : "rules",
          model: llm.model || null,
          error: null,
          checkedAt: Date.now()
        };
      } catch (error) {
        serverStatus = {
          checked: true,
          available: false,
          llmConfigured: false,
          mode: "rules",
          model: null,
          error: error.message || "SERVER_UNAVAILABLE",
          checkedAt: Date.now()
        };
      } finally {
        healthPromise = null;
      }
      return serverStatus;
    })();
    return healthPromise;
  }

  async function completeViaServer(options) {
    var data = await fetchJson(SERVER_COMPLETE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        system: options.system || "",
        user: options.user || "",
        temperature: options.temperature != null ? options.temperature : 0.2,
        maxTokens: options.maxTokens || 1200
      })
    }, options.timeoutMs || 70000, options.signal);
    return normalizeResponse(data, serverStatus.model);
  }

  // ── 直连花费守卫（预算护栏）─────────────────────────────────────────────
  // Key 写在公开源码里时，任何打开页面的人都能用它调模型。这里做一层客户端
  // 兜底：按每次响应的 usage 折算人民币，累积到 localStorage，超过日/会话阈值
  // 就拒绝继续直连，避免余额被一次性循环刷光。
  // 注意：这是"最后一道软护栏"，不可替代平台侧的控制；真 Key 请务必走本地/
  // 服务端持有，不建议长期内置在公开静态页里。
  var BUDGET = {
    dailyLimitYuan: 2,         // 单日累计花费上限（元）
    sessionLimitYuan: 1,       // 单次会话（页面 reload 内）上限（元）
    storeKey: "career-os.direct-budget",
    PRICE_PER_M_INPUT: 2.0,    // 输入（缓存未命中）¥/百万 token，保守取高峰价
    PRICE_PER_M_OUTPUT: 8.0    // 输出 ¥/百万 token，保守取高峰价
  };

  function readBudget() {
    var raw = readStore(window.localStorage, BUDGET.storeKey);
    var parsed = parseConfig(raw);
    var today = new Date().toISOString().slice(0, 10);
    if (parsed.date !== today) return { date: today, spentYuan: 0, sessionYuan: 0 };
    return { date: today, spentYuan: Number(parsed.spentYuan) || 0, sessionYuan: Number(parsed.sessionYuan) || 0 };
  }

  function recordSpend(usage) {
    if (!usage) return;
    var inputTokens = Number(usage.prompt_tokens) || 0;
    var outputTokens = Number(usage.completion_tokens) || 0;
    // 无缓存命中明细时，输入按未命中价计（保守）；若返回了 cached_tokens，可打折。
    var cachedTokens = Number(usage.prompt_cache_hit_tokens) || 0;
    var inputUncached = Math.max(inputTokens - cachedTokens, 0);
    var costYuan = (inputUncached * BUDGET.PRICE_PER_M_INPUT + outputTokens * BUDGET.PRICE_PER_M_OUTPUT) / 1000000;
    var budget = readBudget();
    budget.spentYuan = Number((budget.spentYuan + costYuan).toFixed(6));
    budget.sessionYuan = Number((budget.sessionYuan + costYuan).toFixed(6));
    writeStore(window.localStorage, BUDGET.storeKey, JSON.stringify(budget));
    return { costYuan: costYuan, budget: budget };
  }

  function checkBudget(extraCostYuan) {
    var budget = readBudget();
    if (budget.spentYuan + (extraCostYuan || 0) > BUDGET.dailyLimitYuan) {
      var err = new Error("LLM_BUDGET_EXCEEDED: 今日直连额度（¥" + BUDGET.dailyLimitYuan + "）已用尽，转入本地规则模式");
      err.code = "LLM_BUDGET_EXCEEDED";
      throw err;
    }
    if (budget.sessionYuan + (extraCostYuan || 0) > BUDGET.sessionLimitYuan) {
      var err2 = new Error("LLM_BUDGET_EXCEEDED: 当前会话直连额度（¥" + BUDGET.sessionLimitYuan + "）已用尽，转入本地规则模式");
      err2.code = "LLM_BUDGET_EXCEEDED";
      throw err2;
    }
  }

  async function completeDirect(options, config) {
    if (!directConfigured(config)) throw new Error("LLM_NOT_CONFIGURED");
    // 请求前预检：若已超限，直接拒绝，不再发网络请求。
    checkBudget(0);
    var base = String(config.baseUrl).replace(/\/+$/, "");
    var data = await fetchJson(base + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + config.apiKey
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: options.system || "" },
          { role: "user", content: options.user || "" }
        ],
        temperature: options.temperature != null ? options.temperature : 0.2,
        max_tokens: options.maxTokens || 1200
      })
    }, options.timeoutMs || 70000, options.signal);
    var result = normalizeResponse(data, config.model);
    // 请求后按实际 usage 记账，超限则后续请求被拦。
    recordSpend(result.usage);
    return result;
  }

  function createLlmAdapter() {
    return {
      configured: function () {
        return Boolean(serverStatus.llmConfigured || directConfigured(getConfig()));
      },
      mode: function () {
        if (serverStatus.llmConfigured) return "secure-proxy";
        if (directConfigured(getConfig())) return "browser-direct";
        return "rules";
      },
      refresh: refreshServerStatus,
      status: function () { return Object.assign({}, serverStatus); },
      complete: async function (options) {
        var safeOptions = options || {};
        if (!safeOptions.user) throw new Error("LLM_USER_PROMPT_REQUIRED");
        await refreshServerStatus();
        if (serverStatus.llmConfigured) return completeViaServer(safeOptions);
        var config = getConfig();
        if (directConfigured(config)) return completeDirect(safeOptions, config);
        throw new Error("LLM_NOT_CONFIGURED");
      },
      test: async function (options) {
        return this.complete({
          system: "你是连接测试助手，只回复 OK。",
          user: "连接测试，请只回复 OK。",
          temperature: 0,
          maxTokens: 12,
          signal: options && options.signal
        });
      }
    };
  }

  window.CareerOS = window.CareerOS || {};
  window.CareerOS.llm = {
    createLlmAdapter: createLlmAdapter,
    getConfig: getConfig,
    saveConfig: saveConfig,
    refreshServerStatus: refreshServerStatus,
    getServerStatus: function () { return Object.assign({}, serverStatus); },
    presets: PRESETS
  };
})();
