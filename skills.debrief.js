(function () {
  "use strict";

  function detectPatterns(records) {
    var patterns = [
      { label: "数据与指标", terms: ["数据", "指标", "归因", "结果", "量化"] },
      { label: "表达结构", terms: ["结构", "太长", "重点", "表达", "结论"] },
      { label: "个人贡献", terms: ["团队", "贡献", "个人", "负责", "参与"] },
      { label: "业务理解", terms: ["业务", "案例", "增长", "用户", "指标"] },
      { label: "压力应对", terms: ["压力", "紧张", "追问", "质疑", "打断"] }
    ];
    var text = records.map(function (item) { return [item.improve, item.wentWell, item.questions, item.notes].join(" "); }).join(" ");
    return patterns.filter(function (pattern) {
      return pattern.terms.some(function (term) { return text.indexOf(term) >= 0; });
    }).map(function (pattern) { return pattern.label; });
  }

  window.CareerAgent.registry.register({
    manifest: {
      id: "interview-debrief",
      name: "真实面试复盘",
      version: "0.1.0",
      description: "分析真实面试问题、表现、结果和重复缺口，生成下一轮训练重点。",
      permissions: ["profile:read", "applications:read", "interview:read", "interview:write", "plan:write"],
      intents: ["interview-debrief", "real-interview-review"],
      timeoutMs: 45000
    },

    match(message) {
      return /真实面试|面试复盘|面经|面试记录|面试反馈|记录.*面试|面试.*记录/.test(message);
    },

    async run(input, context) {
      var state = context.state || {};
      var records = Array.isArray(state.interviewDebriefs) ? state.interviewDebriefs : [];
      if (!records.length) {
        return {
          text: "还没有真实面试复盘记录。先记录公司、轮次、问题、自我评分和下一步，再做模式分析。",
          suggestions: ["新增真实面试复盘", "继续模拟面试"],
          actions: [{ label: "记录一次真实面试", action: "open-debrief" }]
        };
      }
      var average = Math.round(records.reduce(function (sum, item) { return sum + Number(item.selfScore || 0); }, 0) / records.length);
      var latest = records.slice().sort(function (a, b) { return new Date(b.date || 0) - new Date(a.date || 0); })[0];
      var patterns = detectPatterns(records);
      var nextActions = Array.from(new Set(records.map(function (item) { return String(item.nextAction || "").trim(); }).filter(Boolean))).slice(0, 3);
      var summary =
        "你已记录 " + records.length + " 场真实面试，平均自评 " + average + "/100。\n\n" +
        "最近一场是 " + latest.company + " · " + latest.role + "（" + latest.round + "），结果：" + (latest.outcome || "待确认") + "。\n\n" +
        (patterns.length ? "重复出现的训练重点：" + patterns.join("、") + "。\n" : "") +
        (nextActions.length ? "下一步优先：" + nextActions.join("；") + "。" : "下一步应补一条具体问题复盘，而不是只记录“感觉不好”。");

      if (context.llm && typeof context.llm.complete === "function") {
        try {
          var model = await context.llm.complete({
            system: "你是面试复盘教练。只分析用户记录的问题和反馈，不编造面试内容。输出重复模式、证据缺口和最多 4 个行动建议。",
            user: "用户请求：" + input.message + "\n\n真实面试记录：" + JSON.stringify(records),
            temperature: 0.15,
            maxTokens: 900
          });
          if (model && model.text) summary = model.text;
        } catch (_error) {
          summary += "\n\n模型暂时不可用，以上由本地复盘规则生成。";
        }
      }

      return {
        text: summary,
        suggestions: ["把重复缺口写进计划", "针对这个问题再模拟一次", "看看投递反馈是否一致"],
        actions: [{ label: "打开面试复盘", view: "interview" }, { label: "查看投递看板", view: "pipeline" }],
        confidence: 0.8
      };
    }
  });
})();
