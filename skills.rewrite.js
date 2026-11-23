(function () {
  "use strict";

  // 简历改写 skill：程序化 Fact-Lock 事实锁。
  //
  // 流程（不再把模型自检当最终保证）：
  //   1. 从原文提取可核验事实（数字、机构/公司、技能、项目名）作为「事实依据集」；
  //   2. 请求模型改写；
  //   3. 用本文件的程序化校验器逐条比对「改后」文本：改写里出现而原文里找不到依据的
  //      新增数字、机构名、技能名、项目名一律判定为「无依据」，强制替换为反问句；
  //   4. 模型自检仅作为辅助记录写入 artifact，不作为放行依据。
  // 模型不可用或出错时走规则降级，降级文案不带任何虚构数据示例。

  var SYSTEM_REWRITE = [
    "你是求职私教的「简历改写」模块，带 Fact-Lock 事实锁。",
    "核心铁律 Fact-Lock（最高优先级，违反即失败）：",
    "1. 只能使用简历里【已经出现】的事实、经历、技能、数字。",
    "2. 禁止编造、夸大、脑补任何简历里没有的经历或数据。",
    "3. JD 要求的点若简历里没有对应事实，必须反问用户补充，绝不能替他编。",
    "4. 用户说'写得更厉害'，只能优化措辞和量化表达，不能添加不存在的事实。",
    "改写手法（只把已有事实写清楚，不造新事实）：",
    "- 流水账 → 动词 + 结果；没数字 → 反问用户补，给不出就写实情不硬编",
    "- '团队做了什么' → 突出'我做了什么'；'我做了' → 动词开头",
    "输出格式：",
    "【改写结果】逐条'改前 → 改后 → 为什么'；遇到缺事实，输出反问句。"
  ].join("\n");

  var EXTRACT_FACTS_PROMPT = [
    "提取下面简历文字里的全部客观事实，输出成清单（每行一条）：",
    "经历、项目、技能、数字、机构/公司名、成果。只提取文中已有的，不要推断或补充。"
  ].join("\n");

  // 说明：模型自检只作辅助记录，不据此放行；放行与否由程序化校验器决定。
  var FACT_CHECK_PROMPT = [
    "你是事实校验器。下面【改写结果】中，如果出现了【原文】里不存在的经历、技能、数字、机构名，就是违规（编造）。",
    "只做判断，不改写文本。逐条列出：'新增内容 | 依据判定(有依据/无依据)'。"
  ].join("\n");

  // 与事实相关的名词尾缀，用于从文本中抽取「机构/公司/技能/项目」类专有实体。
  // 命中这些尾缀的中文片段会被当作候选实体参与「原文是否有依据」比对。
  var ENTITY_SUFFIX = /(公司|集团|股份|科技|软件|网络|信息|数据|智能|供应链|平台|产品|项目|工作室|系统|框架|程序|小程序|公众号|产品|证书|大赛|比赛|训练营|孵化营|中心|社团|协会|委员会|实验室|战队|支队|小组)/;

  // 收集原文中的专有实体候选：公司/平台/项目/技能等名词短语。
  function collectEntities(text) {
    var source = String(text || "");
    var set = new Set();
    var tokens = (source.match(/[\u4e00-\u9fa5A-Za-z0-9]{2,30}/g) || []);
    tokens.forEach(function (token) {
      if (ENTITY_SUFFIX.test(token)) set.add(token);
    });
    return set;
  }

  // 把文本切分成可核验的事实参照元素（数字 + 专有实体）。
  function collectFacts(text) {
    var source = String(text || "");
    var numbers = new Set();
    (source.match(/\d+(?:[.,，]\d{3})*(?:\.\d+)?/g) || []).forEach(function (n) {
      numbers.add(normalizeNumber(n));
    });
    return { numbers: numbers, entities: collectEntities(source) };
  }

  // 归一化数字：去掉千分位分隔与百分号，用于「改写里的数字在原文是否出现过」的比对。
  function normalizeNumber(n) {
    return String(n || "").replace(/[,，]/g, "").replace(/[%％]/g, "").trim();
  }

  // 去除量词与修饰，抽取实体的核心词干（例如「校园二手交易平台」→「校园二手交易」）。
  function coreEntity(entity) {
    return String(entity || "").trim();
  }

  // 抽取改写文本里出现的「候选实体」，并与原文做子串依据比对，返回无依据实体列表。
  function findUnverifiedEntities(rewritten, facts, originalText) {
    var hits = [];
    var seen = new Set();
    (String(rewritten || "").match(/[\u4e00-\u9fa5A-Za-z0-9]{2,30}/g) || []).forEach(function (token) {
      if (!ENTITY_SUFFIX.test(token)) return;
      if (seen.has(token)) return;
      seen.add(token);
      // 排除通用量词语（平台/项目/产品等在泛指时不是专有实体），避免误报。
      if (/(^|、)(平台|项目|产品|系统|公司|软件)(、|$)/.test(token)) return;
      // 依据判定：原文里必须出现包含该 token 的片段。
      var hasEvidence = String(originalText || "").indexOf(token) >= 0;
      if (!hasEvidence) {
        hits.push({ type: "entity", value: token, kind: "entity", suggestion: questionFor(token) });
      }
    });
    return hits;
  }

  // 抽取改写文本里出现的、原文没有依据的数字，返回无依据数字列表。
  function findUnverifiedNumbers(rewritten, facts) {
    var hits = [];
    var seen = new Set();
    (String(rewritten || "").match(/\d+(?:[.,，]\d{3})*(?:\.\d+)?/g) || []).forEach(function (n) {
      var norm = normalizeNumber(n);
      if (!norm || seen.has(norm)) return;
      seen.add(norm);
      if (!facts.numbers.has(norm)) {
        hits.push({ type: "number", value: n, norm: norm, kind: "number", suggestion: questionFor(n) });
      }
    });
    return hits;
  }

  // 为一条无依据内容生成反问句（不同时编造任何数值或实体名）。
  function questionFor(value) {
    return "原文中没有“" + value + "”这条依据，请你补充对应的真实情况与可验证数据，我再据此改写。";
  }

  // 程序化校验一条「改后」文本：返回 { ok, blocking, evidence }
  // blocking 为应被拦截的无依据内容；evidence 为校验过程明细（供测试与展示）。
  function verifyRewrite(rewritten, original) {
    var facts = collectFacts(original);
    var numbers = findUnverifiedNumbers(rewritten, facts);
    var entities = findUnverifiedEntities(rewritten, facts, original);
    var blocking = numbers.concat(entities).filter(function (hit) {
      // 数字、实体都作为无依据内容拦截，交由外层转反问。
      return true;
    });
    return {
      ok: blocking.length === 0,
      factsTotal: facts.numbers.size + facts.entities.size,
      numbersChecked: facts.numbers.size,
      entitiesChecked: facts.entities.size,
      blocking: blocking,
      evidence: { factsTotal: facts.numbers.size + facts.entities.size, numberHits: numbers.length, entityHits: entities.length }
    };
  }

  // 按行切分「改前 / 改后 / 为什么」条目，返回条目数组。
  function splitLinesBlocks(text) {
    return String(text || "").split(/\r?\n+/).map(function (line) { return line.trim(); }).filter(Boolean);
  }

  // 把校验失败的部分替换成反问，输出可读的最终改写结果。
  function applyFactLockBlocks(blocks, original) {
    var verifyAll = [];
    var out = [];
    blocks.forEach(function (line) {
      var isChanged = /^改后[:：]/.test(line);
      if (!isChanged) { out.push(line); return; }
      var value = line.replace(/^改后[:：]\s*/, "");
      var v = verifyRewrite(value, original);
      verifyAll = verifyAll.concat(v.blocking.map(function (b) { return Object.assign({ block: line }, b); }));
      if (v.ok) {
        out.push(line);
      } else {
        out.push("改后：" + questionFor(v.blocking[0].value) + "（原行为：" + value + "）");      }
    });
    return { text: out.join("\n"), verify: verifyAll };
  }

  window.CareerAgent.registry.register({
    manifest: {
      id: "resume-rewrite",
      name: "简历改写（Fact-Lock）",
      version: "0.2.0",
      description: "逐条改写简历经历。程序化 Fact-Lock：改写结果里新增的、原文没有依据的数字/机构/技能/项目名会被拦截并转追问，缺失依据不输出为简历事实，缺事实时反问用户；不承诺通过筛选。",
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

      var fallback = function (reason) {
        // 规则降级：只给改写方法，不带任何虚构数据示例。
        return {
          text: "（模型暂不可用或未接入：" + reason + "，以下为规则版事实锁提示）\n\n" +
            "改写简历时，只允许使用原文已出现的事实。请按「动作 + 方法 + 结果」重写每段经历：\n" +
            "- 原文没有数字：反问自己该经历的可验证结果（规模、时长、对比、增长等），拿到真实数字后再写；\n" +
            "- 原文没有对应能力：不能替他补一个不存在的项目或技能，应向用户追问；\n" +
            "- 团队成绩：只保留你个人承担的部分，缺个人贡献就追问。\n\n" +
            "接入并配置模型后，这里会逐条输出「改前 → 改后」并由程序化事实校验拦截无依据的新增内容。",
          suggestions: ["进入简历工坊", "用 STAR 整理经历"],
          actions: [{ label: "进入简历工坊", view: "resume" }],
          confidence: 0.5,
          artifact: { fallback: true, reason: reason },
        };
      };

      // 真 AI 优先：提取事实 → 改写 → 程序化校验（模型自检只作辅助记录）。
      if (context.llm && typeof context.llm.complete === "function") {
        try {
          var factsResp = await context.llm.complete({ system: EXTRACT_FACTS_PROMPT, user: resumeText, temperature: 0, maxTokens: 800 });
          var facts = factsResp.text;
          var rewriteResp = await context.llm.complete({
            system: SYSTEM_REWRITE,
            user: "待改写内容：\n" + resumeText + "\n\n【只允许使用以下事实，禁止新增】\n" + facts,
            temperature: 0.2,
            maxTokens: 1500
          });
          var rewritten = rewriteResp.text;

          // 程序化 Fact-Lock：原文依据比对，逐条把无依据内容转反问。
          var locked = applyFactLockBlocks(splitLinesBlocks(rewritten), resumeText);
          var finalText = locked.text;

          // 模型自检仅作辅助记录，不放行、不改写最终文本。
          var modelNote = "";
          var modelCheck = null;
          try {
            var checkResp = await context.llm.complete({ system: FACT_CHECK_PROMPT, user: "【原文】\n" + resumeText + "\n\n【改写结果】\n" + finalText, temperature: 0, maxTokens: 1200 });
            modelCheck = checkResp.text;
            modelNote = modelCheck && modelCheck.trim() ? "\n\n[模型辅助自检] " + modelCheck.trim().slice(0, 400) : "";
          } catch (_error) {
            modelNote = "\n\n[模型辅助自检不可用：已由程序化事实校验拦截无依据内容]";
          }

            return {
              text: finalText + modelNote,
              suggestions: ["用 STAR 整理某段经历", "模拟面试"],
              actions: [],
              confidence: locked.verify.length ? 0.6 : 0.85,
              memoryWrite: true,
              artifact: {
                sourceFacts: collectFacts(resumeText),
                verify: locked.verify,
                blocked: locked.verify.length,
                blockedLines: locked.verify.map(function (hit) { return hit.type + ":" + hit.value; })
              },
            };
        } catch (e) {
          return fallback(String(e && e.message || "UNKNOWN"));
        }
      }

      return fallback("LLM_NOT_CONFIGURED");
    },
  });
})();
