(function () {
  "use strict";

  window.CareerAgent.registry.register({
    manifest: {
      id: "major-path",
      name: "专业适配",
      version: "0.1.0",
      description: "根据专业背景生成可迁移优势、目标岗位、能力缺口和补证方向。",
      permissions: ["profile:read", "evidence:read", "roles:read"],
      intents: ["major-fit", "career-transition", "major-to-role"],
      timeoutMs: 45000
    },

    match(message) {
      return /专业|跨专业|文科|理科|工科|商科|法学|医学|计算机|金融|会计|新闻|设计|机械|教育/.test(message) && !/简历|投递|岗位研究/.test(message);
    },

    async run(input, context) {
      var state = context.state || {};
      var fit = context.majorFit && typeof context.majorFit.resolve === "function"
        ? context.majorFit.resolve(state.profile && state.profile.major)
        : window.CareerOS.majorFit.resolve(state.profile && state.profile.major);
      var text =
        "你的专业属于 **" + fit.label + "**，核心可迁移优势是" + fit.identity + "。\n\n" +
        "建议优先验证：" + fit.roles.slice(0, 3).join("、") + "。\n\n" +
        "优势：" + fit.strengths.join("、") + "。\n" +
        "主要缺口：" + fit.gaps.join("、") + "。\n\n" +
        "最值得补的证据：" + fit.proofIdeas[0] + "。";

      if (context.llm && typeof context.llm.complete === "function") {
        try {
          var model = await context.llm.complete({
            system: "你是跨专业求职顾问。只依据用户专业和给定画像，不把专业标签当成能力事实。给出诚实、可验证、可执行的建议。",
            user: "用户问题：" + input.message + "\n专业适配：" + JSON.stringify(fit),
            temperature: 0.2,
            maxTokens: 900
          });
          if (model && model.text) text = model.text;
        } catch (_error) {
          text += "\n\n模型暂时不可用，以上由专业适配规则生成。";
        }
      }

      return {
        text: text,
        suggestions: ["把补证建议写进计划", "这个专业适合哪些岗位", "比较两个方向的 ROI"],
        actions: [{ label: "查看专业迁移路径", view: "positioning" }, { label: "更新专业背景", action: "open-profile" }],
        confidence: 0.8
      };
    }
  });
})();
