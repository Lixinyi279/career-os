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

async function handleApi(req, res, requestId) {
  const pathname = new URL(req.url, "http://localhost").pathname;

  if (pathname === "/api/health" && req.method === "GET") {
    const config = getLlmConfig();
    sendJson(res, 200, {
      ok: true,
      service: "career-os",
      version: "0.8.0",
      llm: {
        configured: isConfigured(),
        mode: isConfigured() ? "secure-proxy" : "rules",
        model: isConfigured() ? config.model : null
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
    console.log("[career-os] http://" + HOST + ":" + PORT);
    console.log("[career-os] model gateway: " + (isConfigured() ? "secure-proxy configured" : "rules fallback"));
  });
}

module.exports = {
  ROOT,
  getLlmConfig,
  isConfigured,
  safeStaticPath,
  validateLlmRequest,
  createServer
};
