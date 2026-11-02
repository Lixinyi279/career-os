(function () {
  "use strict";

  function hasMetric(item) {
    return Array.isArray(item.metrics) && item.metrics.length > 0;
  }

  window.CareerAgent.registry.register({
    manifest: {
      id: "evidence-coach",
      name: "证据审计",
      version: "0.3.0",
      description: "审计经历事实、量化结果与岗位证据缺口，避免简历和面试编造。",
      permissions: ["profile:read", "evidence:read", "evidence:write", "roles:read", "plan:write"],
      intents: ["evidence-review", "evidence-gap", "achievement-audit"],
      timeoutMs: 45000
    },

    match(message) {
      return /证据|补证|素材库|事实库|亮点|经历库|证据审计/.test(message);
    },

    async run(input, context) {
      var state = context.state || {};
      var items = Array.isArray(state.evidence) ? state.evidence : [];
      var strong = items.filter(function (item) { return Number(item.confidence || 0) >= 75; });
      var weak = items.filter(function (item) { return Number(item.confidence || 0) < 70; });
      var withoutMetric = items.filter(function (item) { return !hasMetric(item); });
      var withoutResult = items.filter(function (item) { return !String(item.result || "").trim(); });
      var skills = {};
      items.forEach(function (item) {
        (item.skills || []).forEach(function (skill) { skills[skill] = (skills[skill] || 0) + 1; });
      });
      var topSkills = Object.keys(skills).sort(function (a, b) { return skills[b] - skills[a]; }).slice(0, 6);
      var summary =
        "你目前有 " + items.length + " 条证据，其中强证据 " + strong.length + " 条，较弱证据 " + weak.length + " 条。\n\n" +
        "覆盖较多的能力是：" + (topSkills.join("、") || "尚未标注") + "。\n" +
        (withoutMetric.length ? "有 " + withoutMetric.length + " 条证据缺少可验证指标，优先补结果数字。" : "所有证据都至少有一个量化或可验证结果。") +
        (withoutResult.length ? "另有 " + withoutResult.length + " 条缺少结果描述。" : "") +
        "\n\n建议先补“业务结果”和“决策过程”，再继续润色简历。";

      if (context.llm && typeof context.llm.complete === "function") {
        try {
          var model = await context.llm.complete({
            system: "你是求职证据审计师。只分析用户提供的证据，绝不编造事实。指出证据强弱、岗位相关性、缺失指标，并给出最多 4 个追问。",
            user: "用户请求：" + input.message + "\n\n证据库：\n" + JSON.stringify(items.map(function (item) {
              return { title: item.title, type: item.type, role: item.role, situation: item.situation, action: item.action, result: item.result, metrics: item.metrics, skills: item.skills, confidence: item.confidence };
            })),
            temperature: 0.1,
            maxTokens: 900
          });
          if (model && model.text) summary = model.text;
        } catch (_error) {
          summary += "\n\n模型暂时不可用，以上由本地证据规则生成。";
        }
      }

      return {
        text: summary,
        suggestions: ["哪些证据最值得放进简历", "帮我追问缺失的量化结果", "把证据缺口写进计划"],
        actions: [
          { label: "打开证据库", view: "evidence" },
          { label: "新增一条证据", action: "open-evidence" }
        ],
        confidence: 0.8
      };
    }
  });
})();
