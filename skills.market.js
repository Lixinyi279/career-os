(function () {
  "use strict";

  window.CareerAgent.registry.register({
    manifest: {
      id: "market-brief",
      name: "市场情报",
      version: "0.1.0",
      description: "汇总配置的信息源与本地市场基线，提炼岗位和能力趋势。",
      permissions: ["profile:read", "market:read"],
      intents: ["market-trends", "job-market", "industry-brief"],
      timeoutMs: 45000
    },

    match(message) {
      if (/专业|跨专业/.test(message)) return false;
      return /市场|行业趋势|招聘趋势|就业形势|就业市场|岗位趋势|薪资趋势|行业前景|最新岗位/.test(message);
    },

    async run(input, context) {
      var items = Array.isArray(context.marketItems) ? context.marketItems : [];
      var live = items.filter(function (item) { return item.kind !== "baseline"; });
      var sourceLabel = live.length ? "实时信息源" : "本地基线样本";
      var top = items.slice(0, 6);
      var text = "当前使用" + sourceLabel + "，共 " + items.length + " 条观察。\n\n";
      text += top.length ? top.map(function (item, index) { return (index + 1) + ". " + item.title + (item.source ? "（" + item.source + "）" : ""); }).join("\n") : "还没有可展示的市场信息。";
      text += "\n\n" + (live.length ? "来源和发布时间已保留，请以原始链接为准。" : "这些是产品内置的趋势基线，不代表实时招聘市场。配置 MARKET_FEED_URLS 后才会持续获取外部信息。");

      if (context.llm && typeof context.llm.complete === "function") {
        try {
          var model = await context.llm.complete({
            system: "你是求职市场研究员。只根据提供的市场条目总结趋势，不编造来源、薪资或录取率。区分实时来源与基线样本。",
            user: "用户问题：" + input.message + "\n市场条目：" + JSON.stringify(items.slice(0, 12)),
            temperature: 0.15,
            maxTokens: 900
          });
          if (model && model.text) text = model.text;
        } catch (_error) {
          text += "\n\n模型暂时不可用，以上为本地汇总。";
        }
      }

      return {
        text: text,
        suggestions: ["这些趋势对我的方向有什么影响", "只看 AI 产品岗位", "把市场缺口写进计划"],
        actions: [{ label: "打开市场情报", view: "market" }],
        confidence: live.length ? 0.78 : 0.55
      };
    }
  });
})();
