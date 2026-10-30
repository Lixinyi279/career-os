(function () {
  "use strict";

  // STAR 教练 skill：把流水账经历改写成 STAR 结构，缺要素时追问不编造。
  // 真 AI 优先（context.llm.complete），未接入时降级为规则提示，不报错。

  var SYSTEM_PROMPT = [
    "你是求职私教的「STAR 教练」模块，把流水账经历改写成 STAR 结构。",
    "STAR 四要素：S情境(背景) / T任务(角色目标) / A行动(具体做了什么、什么方法) / R结果(数据/影响)，加 Reflection(练出了什么能力)。",
    "方法：识别缺失要素(最常见缺行动、缺结果) → 追问用户补，不替他编 → 补全后输出完整 STAR。",
    "输出格式：",
    "【STAR 版本】",
    "S：... / T：... / A：... / R：... / Reflection：...",
    "用户给不出结果的，标注'(可补充：这件事的结果是？)'，不硬编；不把课程作业包装成正式实习。"
  ].join("\n");

  window.CareerAgent.registry.register({
    manifest: {
      id: "star-coach",
      name: "STAR 教练",
      version: "0.1.0",
      description: "把一段流水账经历改写成语义清晰的 STAR 结构（情境-任务-行动-结果），只基于真实经历，缺要素追问不编造。",
      permissions: ["profile:read"],
      intents: ["star-coach", "star-rewrite"],
      timeoutMs: 30000,
    },

    match(message) {
      return /STAR|star|经历.{0,4}(有条理|改写|整理)|面试案例|准备.{0,4}案例/.test(message);
    },

    async run(input, context) {
      var state = context.state || {};
      var experience = (input && (input.experience || input.message)) || "";

      if (!experience || experience.trim().length < 4) {
        return {
          text: "把你想整理的那段经历发给我（一句话也行），我用 STAR 帮你改写。",
          suggestions: ["粘贴一段经历"],
          actions: [],
          confidence: 1,
        };
      }

      // 真 AI 优先
      if (context.llm && typeof context.llm.complete === "function") {
        try {
          var resp = await context.llm.complete({ system: SYSTEM_PROMPT, user: "经历：\n" + experience + "\n\n请用 STAR 改写这段经历。", temperature: 0.2, maxTokens: 1200 });
          return {
            text: resp.text,
            suggestions: ["把结果补充进简历", "继续发下一段经历"],
            actions: [],
            confidence: 0.8,
          };
        } catch (e) { /* 降级到规则提示 */ }
      }

      // 规则降级（当前演示模式，未接真 AI）
      return {
        text: "（演示模式：真实 AI 引擎尚未接入，以下为规则版提示）\n\n" +
          "用 STAR 结构整理你的经历：\n" +
          "S 情境：当时什么背景、什么挑战？\n" +
          "T 任务：你负责什么、目标是什么？\n" +
          "A 行动：你具体做了什么、用了什么方法？（这是主体，要具体）\n" +
          "R 结果：最后结果怎么样？有数字就写数字。\n\n" +
          "接入大模型后，这里会自动把你的经历拆成完整的 STAR 四段，并追问你缺失的部分（不替你编）。",
        suggestions: ["进入简历工坊", "继续补充经历"],
        actions: [{ label: "进入简历工坊", view: "resume" }],
        confidence: 0.5,
      };
    },
  });
})();
