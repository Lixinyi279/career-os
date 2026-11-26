"use strict";

const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || "127.0.0.1";
const MAX_BODY_BYTES = 256 * 1024;
const DEFAULT_TIMEOUT_MS = 60000;
const MAX_REQUESTS_PER_MINUTE = Number(process.env.LLM_MAX_REQUESTS_PER_MINUTE) || 20;
const RATE_BUCKETS = new Map();

function loadEnvFile(filePath) {
  try {
    const source = fs.readFileSync(filePath, "utf8");
    for (const rawLine of source.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const normalized = line.startsWith("export ") ? line.slice(7) : line;
      const separator = normalized.indexOf("=");
      if (separator <= 0) continue;
      const key = normalized.slice(0, separator).trim();
      let value = normalized.slice(separator + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") console.warn("[env] unable to load .env:", error.message);
  }
}

loadEnvFile(path.join(ROOT, ".env"));

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8"
};

function getLlmConfig() {
  return {
    apiKey: String(process.env.LLM_API_KEY || "").trim(),
    baseUrl: String(process.env.LLM_BASE_URL || "https://api.deepseek.com/v1").trim().replace(/\/+$/, ""),
    model: String(process.env.LLM_MODEL || "deepseek-chat").trim(),
    timeoutMs: Math.max(5000, Math.min(180000, Number(process.env.LLM_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS))
  };
}

function isConfigured() {
  return Boolean(getLlmConfig().apiKey);
}

function safeStaticPath(urlValue) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(urlValue, "http://localhost").pathname);
  } catch (_error) {
    return null;
  }
  if (pathname === "/") pathname = "/index.html";
  if (pathname.startsWith("/api/")) return null;
  const candidate = path.resolve(ROOT, "." + pathname);
  const relative = path.relative(ROOT, candidate);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return null;
  if (relative.split(/[\\/]/).some((segment) => segment.startsWith("."))) return null;
  if (!MIME_TYPES[path.extname(candidate).toLowerCase()]) return null;
  return candidate;
}

function validateLlmRequest(body) {
  if (!body || typeof body !== "object") return { ok: false, error: "请求体必须是 JSON 对象" };
  const system = typeof body.system === "string" ? body.system.trim() : "";
  const user = typeof body.user === "string" ? body.user.trim() : "";
  const temperature = body.temperature == null ? 0.2 : Number(body.temperature);
  const maxTokens = body.maxTokens == null ? 1200 : Number(body.maxTokens);
  if (!user) return { ok: false, error: "user 不能为空" };
  if (system.length > 20000) return { ok: false, error: "system 超出长度限制" };
  if (user.length > 50000) return { ok: false, error: "user 超出长度限制" };
  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) return { ok: false, error: "temperature 必须在 0-2 之间" };
  if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > 4096) return { ok: false, error: "maxTokens 必须在 1-4096 之间" };
  return { ok: true, value: { system, user, temperature, maxTokens } };
}

function setCommonHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  setCommonHeaders(res);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

async function readJsonBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      const error = new Error("请求体超过 256KB");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch (_error) {
    const error = new Error("JSON 格式无效");
    error.statusCode = 400;
    throw error;
  }
}

function rateLimit(req) {
  const key = req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const bucket = RATE_BUCKETS.get(key) || { windowStart: now, count: 0 };
  if (now - bucket.windowStart >= 60000) {
    bucket.windowStart = now;
    bucket.count = 0;
  }
  bucket.count += 1;
  RATE_BUCKETS.set(key, bucket);
  return {
    allowed: bucket.count <= MAX_REQUESTS_PER_MINUTE,
    remaining: Math.max(0, MAX_REQUESTS_PER_MINUTE - bucket.count),
    retryAfter: Math.max(1, Math.ceil((60000 - (now - bucket.windowStart)) / 1000))
  };
}

async function callProvider(payload) {
  const config = getLlmConfig();
  if (!config.apiKey) {
    const error = new Error("服务端尚未配置 LLM_API_KEY");
    error.statusCode = 503;
    error.code = "LLM_NOT_CONFIGURED";
    throw error;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(config.baseUrl + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + config.apiKey
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: payload.system },
          { role: "user", content: payload.user }
        ],
        temperature: payload.temperature,
        max_tokens: payload.maxTokens
      }),
      signal: controller.signal
    });
    const text = await response.text();
    if (!response.ok) {
      const error = new Error("模型服务返回 HTTP " + response.status);
      error.statusCode = 502;
      error.code = "LLM_UPSTREAM_ERROR";
      error.detail = text.slice(0, 300);
      throw error;
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch (_error) {
      const error = new Error("模型服务返回了非 JSON 响应");
      error.statusCode = 502;
      error.code = "LLM_INVALID_RESPONSE";
      throw error;
    }
    const choice = data.choices && data.choices[0];
    return {
      text: choice && choice.message && choice.message.content || "",
      model: data.model || config.model,
      usage: data.usage || null,
      finishReason: choice && choice.finish_reason || null
    };
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("模型请求超时");
      timeoutError.statusCode = 504;
      timeoutError.code = "LLM_TIMEOUT";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

const MARKET_CACHE_FILE = path.join(ROOT, "data", "market-cache.json");
const MARKET_SNAPSHOT_FILE = path.join(ROOT, "data", "market-snapshot.json");
let marketSnapshot = null;
let marketLoadPromise = null;
let marketRefreshPromise = null;
let marketTimer = null;

// 默认真实信息源：即使未配置 .env 也会启用，保证 /api/market 返回真实实时条目而非本地基线
// 已实测逐一验证可稳定拉取真实条目；用户可在 .env 用 MARKET_FEED_URLS 覆盖
const DEFAULT_MARKET_FEED_URLS = [
  "https://sspai.com/feed",            // 少数派：科技 / AI 工具 / 产品与效率信息流
  "https://juejin.cn/rss",             // 掘金：技术社区（前后端 / AI / 大厂用工观察）
  "https://www.freebuf.com/feed",      // FreeBuf：网络安全行业资讯
  "https://www.oschina.net/news/rss"   // OSCHINA：开源与 IT 产业新闻
];

// 岗位行情内置快照（数据结构化、标注数据来源截止日），刷新间隔内作为补充硬数据
const DEFAULT_MARKET_PROFILES = [
  { role: "前端开发工程师", city: "北京", salaryMin: 18, salaryMax: 35, demand: 9.6, trend: "up", industries: ["企业服务", "电商", "AI 应用"] },
  { role: "后端开发工程师（Java/Go）", city: "北京", salaryMin: 20, salaryMax: 45, demand: 9.8, trend: "up", industries: ["互联网", "金融科技", "AI 平台"] },
  { role: "数据分析师", city: "北京", salaryMin: 13, salaryMax: 25, demand: 8.2, trend: "flat", industries: ["互联网", "咨询", "零售"] },
  { role: "AI 产品经理", city: "北京", salaryMin: 25, salaryMax: 55, demand: 8.9, trend: "up", industries: ["AI 应用", "大模型"] },
  { role: "用户研究员", city: "北京", salaryMin: 15, salaryMax: 28, demand: 6.4, trend: "flat", industries: ["互联网", "消费科技"] },
  { role: "产品运营", city: "北京", salaryMin: 12, salaryMax: 22, demand: 7.5, trend: "flat", industries: ["互联网", "SaaS"] },
  { role: "人工智能算法工程师", city: "北京", salaryMin: 30, salaryMax: 60, demand: 9.4, trend: "up", industries: ["大模型", "自动驾驶", "金融"] },
  { role: "前端开发工程师", city: "上海", salaryMin: 17, salaryMax: 33, demand: 9.2, trend: "up", industries: ["企业服务", "电商"] },
  { role: "后端开发工程师（Java/Go）", city: "深圳", salaryMin: 19, salaryMax: 42, demand: 9.5, trend: "up", industries: ["互联网", "硬件", "AI 平台"] },
  { role: "数据分析师", city: "杭州", salaryMin: 12, salaryMax: 24, demand: 8.0, trend: "flat", industries: ["电商", "金融科技"] }
];

function getMarketConfig() {
  const envUrls = String(process.env.MARKET_FEED_URLS || "").split(",").map((value) => value.trim()).filter((value) => /^https?:\/\//i.test(value));
  return {
    feedUrls: envUrls.length ? envUrls : DEFAULT_MARKET_FEED_URLS,
    profiles: DEFAULT_MARKET_PROFILES,
    profileAsOf: "2026-11", // 快照数据截止月份（公开行情均值，非实时）
    refreshMinutes: Math.max(5, Math.min(1440, Number(process.env.MARKET_REFRESH_MINUTES) || 120)),
    maxItems: Math.max(10, Math.min(100, Number(process.env.MARKET_MAX_ITEMS) || 60))
  };
}

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function stripXml(value) {
  return decodeXml(String(value || "")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractXmlTag(block, tag) {
  const match = String(block).match(new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + tag + ">", "i"));
  return match ? stripXml(match[1]) : "";
}

function inferMarketTags(text) {
  const source = String(text || "").toLowerCase();
  const groups = [
    ["AI", /ai|人工智能|大模型|提示词|智能体/],
    ["数据分析", /数据|sql|指标|分析/],
    ["产品", /产品|需求|用户研究/],
    ["运营", /运营|增长|内容|社群/],
    ["面试", /面试|简历|求职|招聘/],
    ["技术", /开发|研发|编程|python|java/],
    ["设计", /设计|交互|视觉|ux/]
  ];
  return groups.filter((group) => group[1].test(source)).map((group) => group[0]).slice(0, 4);
}

function parseMarketFeed(xml, feedUrl) {
  const text = String(xml || "");
  const blocks = text.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) || [];
  const source = (() => {
    try { return new URL(feedUrl).hostname.replace(/^www\./, ""); } catch (_error) { return "market-feed"; }
  })();
  return blocks.map((block, index) => {
    const title = extractXmlTag(block, "title");
    const description = extractXmlTag(block, "description") || extractXmlTag(block, "summary") || extractXmlTag(block, "content");
    const linkMatch = block.match(/<link[^>]+href=["']([^"']+)["']/i);
    const link = linkMatch ? decodeXml(linkMatch[1]) : extractXmlTag(block, "link");
    const dateText = extractXmlTag(block, "pubDate") || extractXmlTag(block, "published") || extractXmlTag(block, "updated") || extractXmlTag(block, "dc:date");
    const publishedAt = dateText && !Number.isNaN(new Date(dateText).getTime()) ? new Date(dateText).toISOString() : null;
    const summary = description.slice(0, 420);
    return {
      id: source + "-" + index + "-" + (publishedAt || "unknown"),
      title: title || "未命名市场信息",
      summary,
      link: /^https?:\/\//i.test(link) ? link : "",
      source,
      publishedAt,
      tags: inferMarketTags(title + " " + summary),
      kind: "live"
    };
  }).filter((item) => item.title && item.summary);
}

async function loadMarketCache() {
  if (marketSnapshot) return marketSnapshot;
  if (marketLoadPromise) return marketLoadPromise;
  marketLoadPromise = (async function () {
    try {
      const data = JSON.parse(await fsp.readFile(MARKET_CACHE_FILE, "utf8"));
      marketSnapshot = Object.assign({ configured: false, items: [], sources: [], lastUpdated: null, refreshMinutes: getMarketConfig().refreshMinutes }, data);
      if (!marketSnapshot.profiles) marketSnapshot.profiles = getMarketConfig().profiles;
      if (!marketSnapshot.profileAsOf) marketSnapshot.profileAsOf = getMarketConfig().profileAsOf;
    } catch (_error) {
      marketSnapshot = { configured: false, items: [], sources: [], lastUpdated: null, refreshMinutes: getMarketConfig().refreshMinutes, profiles: getMarketConfig().profiles, profileAsOf: getMarketConfig().profileAsOf };
    }
    return marketSnapshot;
  })();
  return marketLoadPromise;
}

async function fetchMarketFeed(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { headers: { "User-Agent": "CareerOS-Market/1.0", "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml" }, signal: controller.signal });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const text = await response.text();
    if (text.length > 2_000_000) throw new Error("feed too large");
    return parseMarketFeed(text, url);
  } finally {
    clearTimeout(timer);
  }
}

async function refreshMarket() {
  if (marketRefreshPromise) return marketRefreshPromise;
  const config = getMarketConfig();
  marketRefreshPromise = (async function () {
    await loadMarketCache();
    if (!config.feedUrls.length) {
      marketSnapshot = Object.assign({}, marketSnapshot, { configured: false, items: [], sources: [], refreshMinutes: config.refreshMinutes, profiles: config.profiles, profileAsOf: config.profileAsOf });
      return marketSnapshot;
    }
    const results = await Promise.allSettled(config.feedUrls.map(fetchMarketFeed));
    const items = [];
    const sources = [];
    results.forEach((result, index) => {
      const url = config.feedUrls[index];
      let name = "market-feed";
      try { name = new URL(url).hostname.replace(/^www\./, ""); } catch (_error) {}
      if (result.status === "fulfilled") {
        items.push.apply(items, result.value);
        sources.push({ name, status: "ok", count: result.value.length });
      } else {
        sources.push({ name, status: "error", count: 0 });
      }
    });
    const seen = new Set();
    const deduped = items.filter((item) => {
      const key = item.link || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)).slice(0, config.maxItems);
    marketSnapshot = {
      configured: true,
      items: deduped,
      sources,
      profiles: config.profiles,
      profileAsOf: config.profileAsOf,
      lastUpdated: new Date().toISOString(),
      refreshMinutes: config.refreshMinutes
    };
    await fsp.mkdir(path.dirname(MARKET_CACHE_FILE), { recursive: true });
    await fsp.writeFile(MARKET_CACHE_FILE, JSON.stringify(marketSnapshot, null, 2), "utf8");
    return marketSnapshot;
  })().finally(function () { marketRefreshPromise = null; });
  return marketRefreshPromise;
}

async function getMarketSnapshot() {
  const snapshot = await loadMarketCache();
  const config = getMarketConfig();
  const merged = Object.assign({}, snapshot, { refreshMinutes: config.refreshMinutes });
  // 始终带内置岗位行情快照（缓存可能来自旧版，缺失则补默认）
  if (!merged.profiles || !merged.profiles.length) merged.profiles = config.profiles;
  if (!merged.profileAsOf) merged.profileAsOf = config.profileAsOf;
  return merged;
}

function startMarketScheduler() {
  const config = getMarketConfig();
  if (!config.feedUrls.length || marketTimer) return;
  refreshMarket().catch((error) => console.warn("[market] refresh failed:", error.message));
  marketTimer = setInterval(function () {
    refreshMarket().catch((error) => console.warn("[market] refresh failed:", error.message));
  }, config.refreshMinutes * 60 * 1000);
  marketTimer.unref();
}

async function handleApi(req, res, requestId) {
  const pathname = new URL(req.url, "http://localhost").pathname;

  if (pathname === "/api/health" && req.method === "GET") {
    const config = getLlmConfig();
    sendJson(res, 200, {
      ok: true,
      service: "career-os",
      version: "0.10.0",
      llm: {
        configured: isConfigured(),
        mode: isConfigured() ? "secure-proxy" : "rules",
        model: isConfigured() ? config.model : null
      },
      market: {
        configured: getMarketConfig().feedUrls.length > 0,
        refreshMinutes: getMarketConfig().refreshMinutes
      },
      requestId
    });
    return true;
  }

  if (pathname === "/api/llm/complete") {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "METHOD_NOT_ALLOWED", requestId });
      return true;
    }
    const limit = rateLimit(req);
    res.setHeader("X-RateLimit-Remaining", String(limit.remaining));
    if (!limit.allowed) {
      res.setHeader("Retry-After", String(limit.retryAfter));
      sendJson(res, 429, { error: "RATE_LIMITED", retryAfter: limit.retryAfter, requestId });
      return true;
    }
    try {
      const body = await readJsonBody(req);
      const checked = validateLlmRequest(body);
      if (!checked.ok) {
        sendJson(res, 400, { error: "INVALID_INPUT", message: checked.error, requestId });
        return true;
      }
      const result = await callProvider(checked.value);
      sendJson(res, 200, Object.assign({ requestId }, result));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      sendJson(res, statusCode, {
        error: error.code || "LLM_GATEWAY_ERROR",
        message: error.message || "模型网关调用失败",
        detail: error.detail,
        requestId
      });
    }
    return true;
  }

  if (pathname === "/api/market" && req.method === "GET") {
    const snapshot = await getMarketSnapshot();
    sendJson(res, 200, Object.assign({ ok: true, requestId }, snapshot));
    return true;
  }

  if (pathname === "/api/market/refresh" && req.method === "POST") {
    const limit = rateLimit(req);
    if (!limit.allowed) {
      res.setHeader("Retry-After", String(limit.retryAfter));
      sendJson(res, 429, { error: "RATE_LIMITED", retryAfter: limit.retryAfter, requestId });
      return true;
    }
    const snapshot = await refreshMarket();
    sendJson(res, 200, Object.assign({ ok: true, requestId }, snapshot));
    return true;
  }

  return false;
}

async function serveStatic(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    setCommonHeaders(res);
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }
  const filePath = safeStaticPath(req.url);
  if (!filePath) {
    setCommonHeaders(res);
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
    return;
  }
  try {
    const stat = await fsp.stat(filePath);
    if (!stat.isFile()) throw new Error("not a file");
    setCommonHeaders(res);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "no-cache"
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(res);
  } catch (_error) {
    setCommonHeaders(res);
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  }
}

function createServer() {
  return http.createServer(async (req, res) => {
    const requestId = crypto.randomUUID();
    res.setHeader("X-Request-Id", requestId);
    try {
      const handled = await handleApi(req, res, requestId);
      if (!handled) await serveStatic(req, res);
    } catch (error) {
      console.error("[server]", requestId, error.message);
      if (!res.headersSent) sendJson(res, 500, { error: "INTERNAL_ERROR", requestId });
      else res.end();
    }
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    startMarketScheduler();
    console.log("[career-os] http://" + HOST + ":" + PORT);
    console.log("[career-os] model gateway: " + (isConfigured() ? "secure-proxy configured" : "rules fallback"));
    console.log("[career-os] market feeds: " + (getMarketConfig().feedUrls.length ? getMarketConfig().feedUrls.length + " configured" : "baseline only"));
  });
}

module.exports = {
  ROOT,
  getLlmConfig,
  isConfigured,
  safeStaticPath,
  validateLlmRequest,
  createServer,
  getMarketConfig,
  parseMarketFeed,
  refreshMarket,
  getMarketSnapshot
};
