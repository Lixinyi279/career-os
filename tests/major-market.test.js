"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { parseMarketFeed, getMarketConfig, createServer } = require("../server");

function loadRuntime() {
  const window = {};
  window.window = window;
  const context = {
    window, console,
    performance: { now: () => 0 },
    setTimeout, clearTimeout, AbortController, URL, Date, JSON, Map, Set, Object, Array, String, Number, Boolean, RegExp, Promise, Error,
  };
  vm.createContext(context);
  return { window, context };
}

test("major fit resolves discipline-specific paths", () => {
  const { window, context } = loadRuntime();
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "major-fit.js"), "utf8"), context, { filename: "major-fit.js" });
  const fit = window.CareerOS.majorFit.resolve("计算机科学与技术");
  assert.equal(fit.id, "tech-data");
  assert.ok(fit.roles.includes("数据产品"));
  assert.ok(window.CareerOS.majorFit.planTasks({ major: "新闻学" }).length >= 2);
});

test("major and market requests route to dedicated Skills", async () => {
  const { window, context } = loadRuntime();
  for (const file of ["agent-core.js", "major-fit.js", "skills.major.js", "skills.market.js", "skills.jobs.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), context, { filename: file });
  }
  const state = { profile: { major: "信息管理与信息系统" }, evidence: [] };
  const major = await window.CareerAgent.orchestrator.handle("我的信息管理专业适合什么工作", { state, majorFit: window.CareerOS.majorFit });
  assert.equal(major.skillId, "major-path");
  const market = await window.CareerAgent.orchestrator.handle("最近招聘市场有什么趋势", { state, marketItems: [{ title: "AI 产品岗位升温", source: "示例源", tags: ["AI"] }] });
  assert.equal(market.skillId, "market-brief");
});

test("RSS market feed parser preserves title, link, tags and source", () => {
  const feed = '<?xml version="1.0"?><rss><channel><item><title>AI 产品岗位更关注数据分析</title><link>https://example.com/jobs/1</link><description><![CDATA[<p>需要用户研究、数据分析和产品协作能力。</p>]]></description><pubDate>Fri, 30 Oct 2026 00:00:00 GMT</pubDate></item></channel></rss>';
  const items = parseMarketFeed(feed, "https://example.com/feed.xml");
  assert.equal(items.length, 1);
  assert.equal(items[0].source, "example.com");
  assert.equal(items[0].link, "https://example.com/jobs/1");
  assert.ok(items[0].tags.includes("AI"));
  assert.ok(items[0].tags.includes("数据分析"));
});

test("market endpoint returns a safe unconfigured state", async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const response = await fetch("http://127.0.0.1:" + server.address().port + "/api/market");
  const data = await response.json();
  await new Promise((resolve) => server.close(resolve));
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(typeof getMarketConfig().refreshMinutes, "number");
});


test("market intelligence exposes a labeled baseline when offline", async () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "market-intelligence.js"), "utf8");
  const window = { location: { protocol: "file:" } };
  window.window = window;
  const context = { window, console, fetch, URL, Date, JSON, Object, Array, String, Number, Boolean, Promise, Error };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "market-intelligence.js" });
  const snapshot = await window.CareerOS.market.fetchSnapshot();
  assert.ok(snapshot.items.length >= 5);
  assert.equal(snapshot.baseline, true);
  assert.ok(snapshot.items.every((item) => item.kind === "baseline"));
});
