# Model Gateway

## 三种运行模式

Model Gateway 在同一接口后面按“优先级”选择当前实际模式，页面右上角模式标签与以下定义一致：

| 模式 | 标识 | 何时生效 | 是否真实调用模型 | 密钥位置 |
| --- | --- | --- | --- | --- |
| 服务端安全代理 | `secure-proxy` | 运行 `server.js` 且 `.env` 配置了 `LLM_API_KEY`，健康检查返回 `llm.configured=true` | ✅ 是 | 服务端环境变量 |
| 浏览器直连 | `browser-direct` | `LLM_NOT_CONFIGURED`（服务端未配置）但浏览器在会话内填了直连 Key | ✅ 是 | 当前标签页 `sessionStorage` |
| 规则降级 | `rules` | 以上两种都不满足 | ❌ 否，纯本地规则提示 | 无 |

判定优先级：`serverStatus.llmConfigured` → 直连配置 → 规则降级。

> 说明：规则降级**不调用任何模型**，Skill 输出为本地规则提示（如“改写简历请按动作+结果+真实数字”），不代表模型曾运行。

## 目标

Model Gateway 为所有 Skill 提供统一的大模型入口，隔离厂商差异、密钥、重试、超时、限流和可观测性。

Skill 只依赖：

    context.llm.complete(options)

## 请求契约

    {
      system: string,
      user: string,
      temperature?: number,
      maxTokens?: number,
      signal?: AbortSignal
    }

系统提示和用户提示都有服务端长度上限。maxTokens 最大为 4096。

## 响应契约

    {
      text: string,
      model: string | null,
      usage: object | null,
      finishReason: string | null
    }

任何非 2xx、非 JSON 或超时错误都会被归一化为稳定错误码：

- LLM_NOT_CONFIGURED
- LLM_TIMEOUT
- LLM_HTTP_状态码
- LLM_FETCH_UNAVAILABLE
- LLM_UPSTREAM_ERROR
- LLM_INVALID_RESPONSE

## 安全代理流程

1. 浏览器调用 POST /api/llm/complete。
2. server.js 校验 JSON、提示长度、temperature 和 maxTokens。
3. 服务端应用每 IP 限流。
4. 服务端从环境变量读取 API Key。
5. server.js 调用配置的 OpenAI-compatible /chat/completions。
6. 服务端归一化输出，只返回正文和必要元数据。
7. 请求写入 requestId，不记录完整简历和面试原文。

## 环境变量

    PORT=4173
    HOST=127.0.0.1
    LLM_BASE_URL=https://api.deepseek.com/v1
    LLM_MODEL=deepseek-chat
    LLM_API_KEY=
    LLM_TIMEOUT_MS=60000
    LLM_MAX_REQUESTS_PER_MINUTE=20

## 健康检查

    GET /api/health

返回：

    {
      "ok": true,
      "version": "0.10.0",
      "llm": {
        "configured": true,
        "mode": "secure-proxy",
        "model": "deepseek-chat"
      }
    }

健康检查不会返回 Key、完整 Base URL 或任何用户数据。

## 生产升级方向

- Redis 全局限流
- 结构化输出和 JSON Schema 校验
- 模型路由与成本预算
- Prompt 版本管理
- 流式响应
- 内容安全与 PII 脱敏
- OpenTelemetry 追踪
- 重试、熔断与降级策略
- 多租户密钥托管
