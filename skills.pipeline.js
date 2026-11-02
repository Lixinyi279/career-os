(function () {
  "use strict";

  function stageLabel(stage) {
    var labels = { applied: "已投递", assessment: "笔试/测评", interview: "面试中", offer: "Offer", closed: "已结束" };
    return labels[stage] || stage || "未知";
  }

  window.CareerAgent.registry.register({
    manifest: {
      id: "pipeline-review",
      name: "投递复盘",
      version: "0.2.0",
      description: "分析投递阶段、停滞岗位和反馈信号，给出下一步优先级。",
      permissions: ["profile:read", "applications:read", "applications:write", "plan:read"],
      intents: ["pipeline-review", "application-feedback", "offer-review"],
      timeoutMs: 45000
    },

    match(message) {
      return /投递|申请|流程|进度|反馈|offer|笔试|测评|内推|挂掉/i.test(message);
    },

    async run(input, context) {
      var state = context.state || {};
      var apps = Array.isArray(state.applications) ? state.applications : [];
      var active = apps.filter(function (item) { return item.stage !== "closed"; });
      var advanced = apps.filter(function (item) { return ["assessment", "interview", "offer"].indexOf(item.stage) >= 0; });
      var interviews = apps.filter(function (item) { return item.stage === "interview"; });
      var offers = apps.filter(function (item) { return item.stage === "offer"; });
      var feedback = apps.filter(function (item) { return String(item.feedback || "").trim(); });
      var stalled = active.filter(function (item) {
        if (!item.updatedAt) return false;
        return Date.now() - new Date(item.updatedAt).getTime() > 7 * 24 * 60 * 60 * 1000;
      });
      var next = active.slice().sort(function (a, b) {
        var ad = a.nextAt ? new Date(a.nextAt).getTime() : Number.MAX_SAFE_INTEGER;
        var bd = b.nextAt ? new Date(b.nextAt).getTime() : Number.MAX_SAFE_INTEGER;
        return ad - bd;
      })[0];
      var summary =
        "当前共 " + apps.length + " 条投递，活跃 " + active.length + " 条，进入测评/面试 " + advanced.length +
        " 条，面试中 " + interviews.length + " 条，Offer " + offers.length + " 条。\n\n" +
        (next
          ? "最近的行动是「" + next.nextAction + "」，对应 " + next.company + " · " + next.role + "（" + stageLabel(next.stage) + "）。"
          : "当前没有待处理的投递行动。可以补充新岗位，或把已结束流程归档复盘。") +
        (feedback.length ? "\n\n已记录 " + feedback.length + " 条反馈。建议先区分是方向问题、简历问题还是面试表达问题，再决定是否扩大投递量。" : "\n\n目前反馈样本不足，不建议只根据一两次结果判断整体方向。");

      if (context.llm && typeof context.llm.complete === "function") {
        try {
          var model = await context.llm.complete({
            system: "你是应届生求职运营顾问。只使用给定的投递数据，不编造公司、反馈或结果。输出最多 5 条可执行建议，每条不超过 35 个汉字。",
            user: "用户问题：" + input.message + "\n\n投递数据：\n" + JSON.stringify({
              active: active.map(function (item) { return { company: item.company, role: item.role, stage: item.stage, nextAction: item.nextAction, nextAt: item.nextAt, feedback: item.feedback }; }),
              stalled: stalled.length,
              feedbackCount: feedback.length
            }),
            temperature: 0.2,
            maxTokens: 700
          });
          if (model && model.text) summary = model.text;
        } catch (_error) {
          summary += "\n\n模型暂时不可用，以上由本地规则生成。";
        }
      }

      return {
        text: summary,
        suggestions: ["哪个岗位最该优先跟进", "分析投递转化率", "根据反馈调整本周计划"],
        actions: [
          { label: "打开投递看板", view: "pipeline" },
          { label: "新增一条投递", action: "open-application" }
        ],
        confidence: 0.78
      };
    }
  });
})();
