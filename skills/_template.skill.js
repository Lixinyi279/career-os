(function () {
  "use strict";

  // This file is a template and is not loaded by index.html.
  window.CareerAgent.registry.register({
    manifest: {
      id: "replace-with-skill-id",
      name: "替换为 Skill 名称",
      version: "0.1.0",
      description: "说明这个 Skill 解决什么问题，以及明确不做什么。",
      permissions: ["profile:read"],
      intents: ["replace-with-intent"],
      timeoutMs: 30000,
      requiresConfirmation: false
    },

    match(message, state) {
      return /触发词一|触发词二/.test(message);
    },

    async run(input, context) {
      const state = context.state;

      // Read only the data declared in manifest.permissions.
      // Return a user-facing result and explicit next actions.
      return {
        text: "给用户的可读结果",
        actions: [],
        suggestions: [],
        artifact: null,
        statePatch: null,
        memoryWrite: false,
        citations: [],
        confidence: 0.72
      };
    }
  });
})();
