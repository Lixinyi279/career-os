# Model Gateway

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
      "version": "0.2.0",
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
