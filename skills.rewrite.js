(function () {
  "use strict";

  // 简历改写 skill：Fact-Lock 事实锁。
  // 真 AI 优先（context.llm.complete），未接入时降级为规则提示，不报错。

  var SYSTEM_REWRITE = [
    "你是求职私教的「简历改写」模块，带 Fact-Lock 事实锁。",
    "核心铁律 Fact-Lock（最高优先级，违反即失败）：",
    "1. 只能使用简历里【已经出现】的事实、经历、技能、数字。",
    "2. 禁止编造、夸大、脑补任何简历里没有的经历或数据。",
    "3. JD 要求的点若简历里没有对应事实，必须反问用户补充，绝不能替他编。",
    "4. 用户说'写得更厉害'，只能优化措辞和量化表达，不能添加不存在的事实。",
    "改写手法：流水账 → 动词 + 结果；没数字 → 反问补；'团队做了什么' → 突出'我做了什么'。",
    "输出格式：逐条「改前 → 改后 → 为什么」；遇到缺事实，输出反问句。"
  ].join("\n");

  var EXTRACT_FACTS_PROMPT = [
    "提取下面简历文字里的全部客观事实，输出成清单（每行一条）：",
    "经历、项目、技能、数字、机构/公司名、成果。只提取文中已有的，不要推断或补充。"
  ].join("\n");

  var FACT_CHECK_PROMPT = [
    "你是事实校验器。下面【改写结果】中，若出现【原文】里不存在的经历、技能、数字、机构名，就是违规（编造）。",
    "判断：改写是否新增了原文没有的事实？",
    "- 若没有新增：原样返回改写结果。",
    "- 若有新增：删除新增部分，改成反问句（如'你调研了多少人？结果如何？'），再输出修正后的改写结果。"
  ].join("\n");

  window.CareerAgent.registry.register({
    manifest: {
      id: "resume-rewrite",
      name: "简历改写（Fact-Lock）",
      version: "0.1.0",
      description: "逐条改写简历经历，强制只使用简历已有事实（Fact-Lock 事实锁），禁止编造，缺事实时反问；不承诺通过筛选。",
      permissions: ["profile:read", "resume:read"],
      intents: ["resume-rewrite", "fact-lock"],
      timeoutMs: 60000,
    },

    match(message) {
      return /改写|帮我改|优化|润色|写得更|这段|定制|改一版/.test(message);
    },

    async run(input, context) {
      var state = context.state || {};
      var resumeText = (state.resume && state.resume.text) || (input && input.resume) || "";

      if (!resumeText || resumeText.trim().length < 10) {
        return {
          text: "请先在简历工坊粘贴你的简历正文，我再帮你改写。",
          suggestions: ["进入简历工坊", "粘贴简历文字"],
          actions: [{ label: "进入简历工坊", view: "resume" }],
          confidence: 1,
        };
      }

      // 真 AI 优先
      if (context.llm && typeof context.llm.complete === "function") {
        try {
          var factsResp = await context.llm.complete({ system: EXTRACT_FACTS_PROMPT, user: resumeText, temperature: 0, maxTokens: 800 });
          var facts = factsResp.text;
          var rewriteResp = await context.llm.complete({ system: SYSTEM_REWRITE, user: "待改写内容：\n" + resumeText + "\n\n【只允许使用以下事实，禁止新增】\n" + facts, temperature: 0.2, maxTokens: 1500 });
          var rewritten = rewriteResp.text;
          var checkResp = await context.llm.complete({ system: FACT_CHECK_PROMPT, user: "【原文】\n" + resumeText + "\n\n【改写结果】\n" + rewritten, temperature: 0, maxTokens: 1200 });
          return {
            text: checkResp.text,
            suggestions: ["用 STAR 整理某段经历", "模拟面试"],
            actions: [],
            confidence: 0.85,
            memoryWrite: true,
          };
        } catch (e) { /* 降级到规则提示 */ }
      }

      // 规则降级（当前演示模式，未接真 AI）
      return {
        text: "（演示模式：真实 AI 引擎尚未接入，以下为规则版提示）\n\n" +
          "改写建议：把每段经历改成「动作 + 方法 + 结果」，并补上数字。\n" +
          "例：把「负责公众号运营」改成「运营校园公众号，发布 30 篇推文，单篇最高阅读 5000+」。\n" +
          "例：把「协助日常工作」改成「协助产品经理整理需求文档 20 份，跟进 3 次版本迭代」。\n\n" +
          "接入大模型后，这里会自动输出逐条「改前 → 改后」并做 Fact-Lock 事实校验（绝不编造经历）。",
        suggestions: ["进入简历工坊", "用 STAR 整理经历"],
        actions: [{ label: "进入简历工坊", view: "resume" }],
        confidence: 0.5,
      };
    },
  });
})();
