(function () {
  "use strict";

  // Model Gateway：把 skill 的 context.llm.complete 接到真实大模型。
  // 用 OpenAI 兼容接口（DeepSeek / 豆包 / 通义 / Qwen 全兼容），Key 只存在浏览器 localStorage。
  // 未配置 Key 时，skill 会自动降级为规则演示模式，不报错。

  var STORAGE_KEY = "career-os.llm-config";

  var PRESETS = {
    deepseek: { label: "DeepSeek（推荐）", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
    qwen: { label: "通义千问", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus" },
    doubao: { label: "豆包（火山方舟）", baseUrl: "https://ark.cn-beijing.volces.com/api/v3", model: "" },
    custom: { label: "自定义（其他 OpenAI 兼容）", baseUrl: "", model: "" },
  };

  function getConfig() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config || {}));
  }

  function createLlmAdapter() {
    return {
      configured: function () {
        var c = getConfig();
        return !!(c.apiKey && c.baseUrl && c.model);
      },
      complete: async function (options) {
        var c = getConfig();
        if (!c.apiKey || !c.baseUrl || !c.model) {
          throw new Error("LLM_NOT_CONFIGURED");
        }
        var base = String(c.baseUrl).replace(/\/+$/, "");
        var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        if (options.signal && controller) {
          options.signal.addEventListener("abort", function () { controller.abort(); });
        }
        var resp = await fetch(base + "/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + c.apiKey,
          },
          signal: controller ? controller.signal : undefined,
          body: JSON.stringify({
            model: c.model,
            messages: [
              { role: "system", content: options.system || "" },
              { role: "user", content: options.user || "" },
            ],
            temperature: options.temperature != null ? options.temperature : 0.2,
            max_tokens: options.maxTokens || 1200,
          }),
        });
        if (!resp.ok) {
          var errText = "";
          try { errText = await resp.text(); } catch (e) {}
          throw new Error("LLM_HTTP_" + resp.status + (errText ? ":" + errText.slice(0, 200) : ""));
        }
        var data = await resp.json();
        return {
          text: (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "",
          model: data.model || c.model,
          usage: data.usage || null,
          finishReason: (data.choices && data.choices[0] && data.choices[0].finish_reason) || null,
        };
      },
    };
  }

  window.CareerOS = window.CareerOS || {};
  window.CareerOS.llm = {
    createLlmAdapter: createLlmAdapter,
    getConfig: getConfig,
    saveConfig: saveConfig,
    presets: PRESETS,
  };
})();
