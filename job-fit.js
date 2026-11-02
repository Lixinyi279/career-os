(function () {
  "use strict";

  var CATEGORIES = [
    { key: "user-research", label: "用户研究", terms: ["用户研究", "用户访谈", "访谈", "用户洞察", "需求调研", "问卷"] },
    { key: "data", label: "数据分析", terms: ["数据分析", "数据", "指标", "sql", "excel", "统计", "可视化"] },
    { key: "growth", label: "增长运营", terms: ["用户增长", "增长", "留存", "转化", "拉新", "活动运营", "社群"] },
    { key: "content", label: "内容运营", terms: ["内容运营", "内容", "选题", "公众号", "文案", "排版"] },
    { key: "project", label: "项目推动", terms: ["项目管理", "推动", "协调", "跨团队", "协作", "落地"] },
    { key: "product", label: "产品能力", terms: ["产品", "需求文档", "原型", "figma", "用户故事"] },
    { key: "experiment", label: "实验与验证", terms: ["a/b", "ab test", "实验", "灰度", "假设验证"] },
    { key: "tech", label: "技术理解", terms: ["python", "sql", "数据库", "api", "大模型", "提示词", "ai 产品"] },
    { key: "communication", label: "沟通表达", terms: ["沟通", "表达", "汇报", "协作", "推动"] },
    { key: "business", label: "商业理解", terms: ["商业化", "营收", "成本", "roi", "商业模式", "市场"] }
  ];

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function evidenceCorpus(evidence) {
    return (Array.isArray(evidence) ? evidence : []).map(function (item) {
      return [
        item.title, item.role, item.type, item.situation, item.action, item.result,
        (item.metrics || []).join(" "), (item.skills || []).join(" ")
      ].join(" ");
    }).join(" ");
  }

  function categoryPresent(text, category) {
    return category.terms.some(function (term) { return text.indexOf(term) >= 0; });
  }

  function analyze(job, evidence, resume) {
    var jdText = normalize(job && (job.jd || job.description || "") || ((job && job.role || "") + " " + (job && job.company || "")));
    var corpus = normalize(evidenceCorpus(evidence));
    var metricsCount = (Array.isArray(evidence) ? evidence : []).reduce(function (sum, item) {
      return sum + (Array.isArray(item.metrics) ? item.metrics.length : 0);
    }, 0);
    var required = CATEGORIES.filter(function (category) { return categoryPresent(jdText, category); });
    if (!required.length) required = CATEGORIES.filter(function (category) { return /运营|产品|数据/.test(jdText) && ["user-research", "data", "project"].indexOf(category.key) >= 0; });
    var matched = required.filter(function (category) { return categoryPresent(corpus, category); });
    var missing = required.filter(function (category) { return !categoryPresent(corpus, category); });
    var coverage = required.length ? Math.round((matched.length / required.length) * 100) : 45;
    var resumeScore = Number(resume && resume.score || 0);
    var score = Math.round(28 + coverage * 0.52 + Math.min(16, metricsCount * 2) + Math.min(12, resumeScore * 0.14));
    score = Math.max(25, Math.min(96, score));
    var nextActions = missing.slice(0, 3).map(function (category) {
      return "补一条能证明「" + category.label + "」的真实经历或结果";
    });
    if (!nextActions.length) nextActions.push("用该岗位 JD 的关键词重写一条最相关证据");
    if (metricsCount < 3) nextActions.push("为最强项目补充可验证指标");
    return {
      score: score,
      coverage: coverage,
      requiredCount: required.length,
      matched: matched.map(function (category) { return category.label; }),
      missing: missing.map(function (category) { return category.label; }),
      nextActions: nextActions,
      confidence: required.length >= 4 ? 0.82 : 0.62
    };
  }

  window.CareerOS = window.CareerOS || {};
  window.CareerOS.jobFit = { analyze: analyze, categories: CATEGORIES };
})();
