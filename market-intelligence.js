(function () {
  "use strict";

  var BASELINE_DATE = "2026-10-30";
  var BASELINE = [
    { id: "baseline-1", title: "产品运营岗位持续强调数据分析与实验能力", summary: "JD 中常见指标分析、A/B 实验、用户研究和跨团队推动要求。用真实项目结果证明比罗列工具更重要。", tags: ["产品运营", "数据分析", "实验"], source: "Career OS 基线样本", publishedAt: BASELINE_DATE, kind: "baseline" },
    { id: "baseline-2", title: "数据产品更看重业务抽象和 SQL 证据", summary: "除了数据工具，企业更关注能否把业务问题转成数据模型、指标口径和产品需求。", tags: ["数据产品", "SQL", "业务分析"], source: "Career OS 基线样本", publishedAt: BASELINE_DATE, kind: "baseline" },
    { id: "baseline-3", title: "AI 应用岗位开始关注模型评测与边界理解", summary: "AI 产品与运营岗位逐渐要求理解提示词、评测集、幻觉风险和人工反馈闭环，但不应夸大个人技术深度。", tags: ["AI 产品", "评测", "提示词"], source: "Career OS 基线样本", publishedAt: BASELINE_DATE, kind: "baseline" },
    { id: "baseline-4", title: "内容与用户运营更加关注留存和转化", summary: "单篇阅读量和活动人数仍然有用，但企业更希望看到用户分层、留存、转化或复购变化。", tags: ["用户运营", "内容运营", "转化"], source: "Career OS 基线样本", publishedAt: BASELINE_DATE, kind: "baseline" },
    { id: "baseline-5", title: "应届生项目案例更强调个人贡献和决策过程", summary: "招聘方越来越警惕团队成果归因模糊。需要说明你做了什么判断、如何验证、遇到什么取舍。", tags: ["面试", "项目", "STAR"], source: "Career OS 基线样本", publishedAt: BASELINE_DATE, kind: "baseline" }
  ];

  var state = {
    configured: false,
    lastUpdated: null,
    refreshMinutes: 120,
    items: mergeItems([]),
    sources: [],
    error: null,
    loading: false
  };

  function mergeItems(liveItems) {
    var baseline = BASELINE.map(function (item) { return Object.assign({}, item); });
    return (Array.isArray(liveItems) ? liveItems : []).concat(baseline);
  }

  async function fetchSnapshot() {
    state.loading = true;
    if (!/^https?:$/.test(window.location.protocol)) {
      state.items = mergeItems([]);
      state.loading = false;
      return snapshot();
    }
    try {
      var response = await fetch("/api/market", { headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error("MARKET_HTTP_" + response.status);
      var data = await response.json();
      state.configured = Boolean(data.configured);
      state.lastUpdated = data.lastUpdated || null;
      state.refreshMinutes = data.refreshMinutes || 120;
      state.sources = data.sources || [];
      state.items = mergeItems(data.items);
      state.error = null;
    } catch (error) {
      state.items = mergeItems([]);
      state.error = error.message;
    }
    state.loading = false;
    return snapshot();
  }

  async function refreshSnapshot() {
    state.loading = true;
    try {
      var response = await fetch("/api/market/refresh", { method: "POST", headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error("MARKET_REFRESH_HTTP_" + response.status);
      var data = await response.json();
      state.configured = Boolean(data.configured);
      state.lastUpdated = data.lastUpdated || null;
      state.refreshMinutes = data.refreshMinutes || 120;
      state.sources = data.sources || [];
      state.items = mergeItems(data.items);
      state.error = null;
    } catch (error) {
      state.error = error.message;
      if (!state.items.length) state.items = mergeItems([]);
    }
    state.loading = false;
    return snapshot();
  }

  function snapshot() {
    return {
      configured: state.configured,
      lastUpdated: state.lastUpdated,
      refreshMinutes: state.refreshMinutes,
      sources: state.sources.slice(),
      items: state.items.slice(),
      error: state.error,
      loading: state.loading,
      baseline: !state.configured
    };
  }

  window.CareerOS = window.CareerOS || {};
  window.CareerOS.market = { fetchSnapshot: fetchSnapshot, refreshSnapshot: refreshSnapshot, snapshot: snapshot };
})();
