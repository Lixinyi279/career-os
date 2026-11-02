(function () {
  "use strict";

  // This file is a template and is not loaded by index.html.
  window.CareerAgent.registry.register({
    manifest: {
      id: "replace-with-skill-id",
      name: "替换为 Skill 名称",
      version: "0.2.0",
      description: "说明这个 Skill 解决什么问题，以及明确不做什么。",
      permissions: ["profile:read"],
      intents: ["replace-with-intent"],
      timeoutMs: 45000,
      requiresConfirmation: false
    },

    match(message, state) {
      return /触发词一|触发词二/.test(message);
    },

    async run(input, context) {
      const state = context.state;
      let modelResult = null;
      let degraded = false;

      // context.llm is provided by model-gateway.js.
      // It prefers the secure server proxy and falls back to rules when unavailable.
      if (context.llm && context.llm.configured()) {
        try {
          modelResult = await context.llm.complete({
            system: "你是求职策略顾问。只使用用户提供的事实，不得编造经历。",
            user: "用户输入：\n" + input.message,
            temperature: 0.2,
            maxTokens: 1200
          });
        } catch (error) {
          degraded = true;
          console.warn("[Skill] model call failed, using rules", error.message);
        }
      }

      return {
        text: modelResult && modelResult.text
          ? modelResult.text
          : "模型未连接，这是规则模式返回的可执行建议。",
        actions: [],
        suggestions: [],
        artifact: null,
        statePatch: null,
        memoryWrite: false,
        citations: [],
        confidence: modelResult ? 0.82 : 0.58,
        model: modelResult ? modelResult.model : null,
        degraded: degraded
      };
    }
  });
})();
