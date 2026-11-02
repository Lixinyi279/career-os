(function () {
  "use strict";

  function pickJob(jobs, message) {
    var list = Array.isArray(jobs) ? jobs : [];
    var exact = list.find(function (job) { return message.indexOf(job.company) >= 0 || message.indexOf(job.role) >= 0; });
    if (exact) return exact;
    return list.slice().sort(function (a, b) {
      var priority = { P0: 0, P1: 1, P2: 2 };
      var ap = priority[a.priority] == null ? 9 : priority[a.priority];
      var bp = priority[b.priority] == null ? 9 : priority[b.priority];
      if (ap !== bp) return ap - bp;
      var ad = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      var bd = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      return ad - bd;
    })[0] || null;
  }

  window.CareerAgent.registry.register({
    manifest: {
      id: "job-fit",
      name: "岗位研究",
      version: "0.1.0",
      description: "将目标岗位 JD 与证据库做结构化匹配，输出覆盖率、缺口和验证行动。",
      permissions: ["profile:read", "jobs:read", "evidence:read", "roles:read"],
      intents: ["job-analysis", "jd-match", "job-research"],
      timeoutMs: 45000
    },

    match(message) {
      if (/简历|改写|润色/.test(message)) return false;
      return /岗位研究|岗位分析|目标岗位|JD 分析|JD分析|职位要求|岗位要求|岗位匹配/.test(message);
    },

    async run(input, context) {
      var state = context.state || {};
      var jobs = Array.isArray(state.jobTargets) ? state.jobTargets : [];
      var job = pickJob(jobs, input.message);
      if (!job) {
        return {
          text: "还没有可分析的目标岗位。先在岗位研究里加入公司、岗位和完整 JD。",
          suggestions: ["新增目标岗位", "先做方向定位"],
          actions: [{ label: "新增目标岗位", action: "open-job" }, { label: "查看方向定位", view: "positioning" }]
        };
      }
      var analysis = context.jobFit && typeof context.jobFit.analyze === "function"
        ? context.jobFit.analyze(job, state.evidence, state.resume)
        : window.CareerOS.jobFit.analyze(job, state.evidence, state.resume);
      var summary =
        job.company + " · " + job.role + " 当前匹配度 **" + analysis.score + "%**。\n\n" +
        "JD 要求覆盖 " + analysis.requiredCount + " 类能力，其中已找到 " + analysis.matched.length + " 类证据，覆盖率 " + analysis.coverage + "%。\n" +
        (analysis.matched.length ? "可迁移证据：" + analysis.matched.join("、") + "。\n" : "") +
        (analysis.missing.length ? "主要缺口：" + analysis.missing.join("、") + "。\n\n" : "\n") +
        "下一步：" + analysis.nextActions.slice(0, 3).join("；") + "。";

      if (context.llm && typeof context.llm.complete === "function") {
        try {
          var model = await context.llm.complete({
            system: "你是岗位研究与求职匹配顾问。只依据给定 JD 和证据分析，不编造经历。输出简洁、诚实、可执行的建议。",
            user: "岗位：" + job.company + " / " + job.role + "\nJD：\n" + job.jd + "\n\n结构化匹配：" + JSON.stringify(analysis) + "\n\n证据库：" + JSON.stringify(state.evidence || []) + "\n\n用户问题：" + input.message,
            temperature: 0.2,
            maxTokens: 900
          });
          if (model && model.text) summary = model.text;
        } catch (_error) {
          summary += "\n\n模型暂时不可用，以上由岗位匹配规则生成。";
        }
      }

      return {
        text: summary,
        suggestions: ["这个岗位最缺什么证据", "帮我调整目标岗位优先级", "把这几个缺口写进计划"],
        actions: [{ label: "打开岗位研究", view: "jobs" }, { label: "查看投递看板", view: "pipeline" }],
        confidence: analysis.confidence
      };
    }
  });
})();
