# 职途 Career OS

面向应届生的一站式求职 Agent。当前版本已经具备可交互工作台、画像驱动、Skill 编排和真实模型网关。

GitHub: https://github.com/Lixinyi279/career-os

## 当前能力

- 求职工作台、就绪度与下一步行动
- 个人画像、求职约束和长期记忆
- 职业方向匹配与目标岗位锁定
- 简历诊断、JD 对比与 Fact-Lock 改写
- STAR 经历教练
- 行为面、案例面、压力面训练
- 回答评分、反馈和训练报告
- 周计划生成、负荷检查与任务导出
- Skill Registry、意图路由和规则降级
- 安全模型网关：浏览器不接触服务端 API Key
- 浏览器临时直连模式：仅用于静态体验

## 推荐启动方式

需要 Node.js 20 或更高版本，无第三方依赖。

1. 创建本地环境配置：

    Copy-Item .env.example .env

2. 编辑 .env：

    LLM_BASE_URL=https://api.deepseek.com/v1
    LLM_MODEL=deepseek-chat
    LLM_API_KEY=你的_Key

3. 启动：

    npm start

4. 打开：

    http://127.0.0.1:4173

未配置 LLM_API_KEY 时，应用仍可运行，但模型相关 Skill 会降级为本地规则模式。

## 静态体验

也可以直接打开 index.html。

静态模式没有安全后端代理，若需要真模型，只能在模型设置里临时填写浏览器直连 Key。该 Key 仅保存在 sessionStorage，但仍建议仅用于本地体验。

## 模型调用协议

Skill 统一通过 context.llm.complete 调用模型：

    const response = await context.llm.complete({
      system: "你是求职策略顾问",
      user: input.message,
      temperature: 0.2,
      maxTokens: 1200
    });

    console.log(response.text);

返回结构：

    {
      text: "模型正文",
      model: "deepseek-chat",
      usage: { input_tokens: 100, output_tokens: 50 },
      finishReason: "stop"
    }

模型选择、密钥、超时、限流和错误归一化由 Model Gateway 处理，Skill 不直接依赖厂商 SDK。

## 模型网关模式

安全代理模式：

    Browser -> /api/llm/complete -> server.js -> OpenAI-compatible provider

- 推荐用于部署
- API Key 只存在服务端环境变量
- 浏览器只收到模型结果
- 内置输入长度校验、请求限流、超时与请求 ID
- 不会向前端返回上游密钥或完整错误正文

浏览器直连模式：

    Browser -> provider /chat/completions

- 仅用于直接打开 index.html 的体验场景
- Key 存在 sessionStorage，不写入 localStorage
- 刷新页面后需要重新填写

## 文件结构

    career-agent/
      index.html
      server.js
      model-gateway.js
      agent-core.js
      app.js
      assets/styles.css
      skills.career.js
      skills.resume.js
      skills.interview.js
      skills.plan.js
      skills.rewrite.js
      skills.star.js
      skills/
        manifest.schema.json
        _template.skill.js
      tests/
        server.test.js
        model-gateway.test.js
      docs/
        LLM_GATEWAY.md
      ARCHITECTURE.md
      .env.example
      package.json

## 测试

    npm test
    npm run check

如需连接本机模型兼容服务，可将 LLM_BASE_URL 改为本地 OpenAI 兼容地址，例如：

    LLM_BASE_URL=http://127.0.0.1:11434/v1
    LLM_MODEL=qwen2.5:7b

## 新增 Skill

参考 skills/_template.skill.js。每个 Skill 必须声明：

- id
- name
- version
- description
- permissions
- intents
- timeoutMs
- match()
- run()

新增脚本后需要在 index.html 中、app.js 之前引入。

## 数据与隐私

- 当前画像和任务保存在浏览器 localStorage
- 服务端不持久化对话
- .env 已被 .gitignore 排除
- 不要把 API Key 提交到 Git
- 生产接入前应增加用户认证、加密存储和删除机制

详细架构见 ARCHITECTURE.md，模型网关协议见 docs/LLM_GATEWAY.md。
