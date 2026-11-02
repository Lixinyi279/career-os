# 职途 Career OS

面向应届生的一站式求职 Agent，把职业定位、岗位选择、证据整理、简历优化、面试训练、投递跟进和策略复盘放进同一个可交互工作台。

当前版本：**v0.5.0**  
运行要求：**Node.js 20+，无第三方依赖**  
仓库地址：https://github.com/Lixinyi279/career-os

---

## 为什么做这个项目

应届生求职通常不是缺少一个聊天机器人，而是缺少一套持续运转的系统：

- 不知道自己适合什么方向
- 方向很多，但无法判断先验证哪一个
- 简历里写了很多事，却没有岗位需要的证据
- 面试回答很长，但个人贡献和结果不清楚
- 投递后只记录状态，没有把反馈变成下一步动作
- 每次向 AI 提问，都要重新解释背景和约束

职途用“画像 + 证据 + 决策 + 行动 + 市场反馈”构成闭环。Agent 不只是回答问题，还会维护结构化状态、选择 Skill、生成任务，并根据后续反馈调整方案。

---

## 核心闭环

1. **职业定位**：结合背景、偏好、现实约束和市场岗位，确定值得验证的方向。
2. **证据沉淀**：把项目、课程、实习和校园经历整理成可复用、可核验的事实。
3. **简历优化**：根据目标 JD 诊断材料，并在 Fact-Lock 规则下改写。
4. **面试训练**：使用行为面、案例面和压力面训练表达与证据密度。
5. **投递管理**：记录阶段、下一步和真实反馈，形成求职漏斗。
6. **持续复盘**：根据任务完成、证据质量、面试表现和投递结果更新计划与就绪度。

---

## 功能总览

### 1. 求职工作台

- 求职就绪度与四维拆解：定位、材料、面试、市场反馈
- 当前主攻方向与岗位匹配摘要
- 五阶段求职路径：定位 -> 目标 -> 简历 -> 面试 -> 投递复盘
- 下一步关键动作、本周任务完成率和投递反馈摘要
- 移动端与桌面端响应式布局
- 新用户三步引导，自动生成第一版行动计划
- 完整求职档案 Markdown 一键导出

### 2. 个人画像与长期记忆

- 学校、专业、毕业年份、目标方向、目标行业和城市
- 每周可投入时间、现有经历水平和现实约束
- 用户偏好与关键目标沉淀为长期记忆
- 画像完整度直接参与定位与方案生成

### 3. 方向定位与目标锁定

- 产品运营、数据产品、用户研究和 AI 产品运营等方向匹配
- 匹配度、岗位供给、能力迁移和主要缺口说明
- 主攻、第二方向、观察和探索四种策略状态
- 目标方向变化会写入长期记忆并影响后续计划

### 4. 证据库与 Fact-Lock 审计

- 统一管理项目、课程项目、实习、校园经历和其他证据
- 每条证据包含情境、行动、结果、量化指标、能力标签和置信度
- 简历、STAR 和面试准备共享同一事实源
- 自动识别缺指标、缺结果、低置信度和能力重复问题
- 证据缺口可一键转成补证任务
- 核心原则：没有真实数据就保留空白，不把模型猜测写成事实

### 5. 简历工坊

- 简历正文编辑和目标 JD 对比
- 结构、成果量化、岗位相关性和表达密度诊断
- 针对简历问题生成修改任务
- 浏览器内读取 .txt / .md 文件
- Fact-Lock 改写：先提取事实，再改写，再检查是否新增了不存在的信息
- 浏览器直连模型不可用时自动降级为规则提示

### 6. STAR 与模拟面试

- 行为面试、业务案例和压力测试三种模式
- 温和、标准、高压三档强度
- 逐题回答、即时结构反馈和评分
- 训练报告、最佳回答和最需重练的问题
- STAR 教练根据真实经历生成故事结构，不编造结果
- 压力模式会追问证据边界和个人贡献

### 7. 投递看板

- 已投递、笔试/测评、面试中、Offer、已结束五阶段
- 公司、岗位、城市、来源、匹配度、投递日期和下一步日期
- 记录真实反馈、面试风格和待补材料
- 响应率、反馈样本和停滞流程可视化
- 一键推进阶段，自动提示补充结束反馈
- 投递进展和反馈数量纳入求职就绪度

### 8. 行动计划

- 按每周可用时间生成任务，不把日历填满
- 简历、岗位研究、面试、投递、人脉和复盘分类
- P0/P1/P2 优先级、预计时长和完成标准
- 负荷检查与过载提醒
- 任务导出和计划版本管理
- 证据缺口、简历诊断和投递复盘都能生成行动任务

### 9. Agent 对话与 Skill 编排

- 意图路由和专用 Skill 优先匹配
- 未被专用 Skill 命中时走通用求职对话
- 对话结果可带跳转动作和下一步建议
- Skill Registry 支持版本、权限、意图和超时声明
- 结构化状态写回 localStorage
- AI 不可用时保留规则降级路径

---

## 已接入的 8 个专用 Skill

| Skill ID | 能力 | 典型输入 |
| --- | --- | --- |
| **career-positioning** | 职业方向分析、岗位匹配与主攻建议 | “帮我判断适合什么岗位” |
| **resume-review** | 简历结构、成果和 JD 相关性诊断 | “分析我的简历” |
| **mock-interview** | 行为面、案例面和压力面训练 | “开始一次压力面试” |
| **plan-builder** | 按时间和优先级生成行动方案 | “根据反馈重排本周计划” |
| **resume-rewrite** | Fact-Lock 简历改写与事实检查 | “用证据重写我的项目经历” |
| **star-coach** | 将真实经历整理成 STAR 回答 | “把这段经历改成 STAR” |
| **pipeline-review** | 识别停滞投递、反馈信号和优先行动 | “复盘我的投递流程” |
| **evidence-coach** | 审计证据缺口、量化结果和岗位相关性 | “审计我的证据库” |

路由规则：

- 投递、流程、反馈类请求优先走 **pipeline-review**
- 证据、补证、素材类请求优先走 **evidence-coach**
- 明确的周计划、任务和时间安排仍优先走 **plan-builder**
- 所有模型能力都可以在服务端未配置时降级为本地规则

---

## 快速启动

### 推荐方式：安全模型代理

需要 Node.js 20 或更高版本，无第三方依赖。

1. 创建环境配置：

    Copy-Item .env.example .env

macOS / Linux 使用：

    cp .env.example .env

2. 编辑 .env：

    LLM_BASE_URL=https://api.deepseek.com/v1
    LLM_MODEL=deepseek-chat
    LLM_API_KEY=你的_Key

3. 启动：

    npm start

4. 打开：

    http://127.0.0.1:4173

5. 检查服务：

    GET http://127.0.0.1:4173/api/health

未配置 LLM_API_KEY 时，应用仍可使用，但模型相关 Skill 会降级为本地规则模式。

### 静态体验

也可以直接打开 index.html。

静态模式没有安全后端代理。如需真模型，可以在右上角模型设置里临时填写浏览器直连 Key。直连 Key 只保存在 sessionStorage，但仍建议只用于本地体验。

---

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| **PORT** | 4173 | 本地服务端口 |
| **HOST** | 127.0.0.1 | 监听地址 |
| **LLM_BASE_URL** | https://api.deepseek.com/v1 | OpenAI-compatible 接口地址 |
| **LLM_MODEL** | deepseek-chat | 服务端使用的模型 |
| **LLM_API_KEY** | 空 | 模型密钥，只放在服务端 |
| **LLM_TIMEOUT_MS** | 60000 | 上游模型超时 |
| **LLM_MAX_REQUESTS_PER_MINUTE** | 20 | 单 IP 每分钟请求上限 |

.env 已被 .gitignore 排除，不会进入仓库。

---

## 模型网关

### 安全代理模式

    Browser -> /api/llm/complete -> server.js -> OpenAI-compatible provider

特点：

- API Key 只存在服务端环境变量
- 浏览器只收到模型结果
- 输入长度、temperature、maxTokens 经过服务端校验
- 内置单 IP 限流、请求超时和 requestId
- 上游密钥不会出现在健康检查或客户端错误中
- 支持 DeepSeek、通义、豆包、Qwen 和自定义 OpenAI-compatible 服务

### 浏览器直连模式

    Browser -> provider /chat/completions

仅用于直接打开 index.html 的静态体验。

- API Key 只存 sessionStorage
- 不写入 localStorage
- 刷新页面后需要重新输入
- 服务端安全代理优先于直连配置

### Skill 调用协议

所有 Skill 统一通过：

    const response = await context.llm.complete({
      system: "你是求职策略顾问",
      user: input.message,
      temperature: 0.2,
      maxTokens: 1200
    });

返回结构：

    {
      text: "模型正文",
      model: "deepseek-chat",
      usage: { input_tokens: 100, output_tokens: 50 },
      finishReason: "stop"
    }

模型选择、密钥、超时、限流和错误归一化都由 Model Gateway 处理。Skill 不直接依赖厂商 SDK。

更多说明见 [docs/LLM_GATEWAY.md](./docs/LLM_GATEWAY.md)。

---

## 结构化数据模型

当前核心状态包括：

- **profile**：教育背景、目标方向、城市、时间与约束
- **evidence**：项目、课程、实习和校园经历的事实条目
- **roles**：职业方向假设、匹配度和能力缺口
- **resume**：简历正文、目标 JD、诊断维度和问题
- **interview**：训练模式、回答历史、评分和报告
- **applications**：投递阶段、下一步、截止日和真实反馈
- **tasks**：周计划、优先级、时长和完成状态
- **memory**：用户偏好、目标和重要变化
- **messages**：Agent 对话与 Skill 路由结果

当前使用 localStorage 持久化。生产版本应迁移到 PostgreSQL，并为证据、简历和计划增加版本历史。

---

## 项目结构

    career-agent/
      index.html                 应用外壳与导航
      server.js                  静态服务、健康检查、模型代理、限流
      model-gateway.js           安全代理/浏览器直连/规则降级适配
      agent-core.js              Skill Registry、EventBus、Orchestrator
      app.js                     领域状态、页面渲染和交互
      assets/styles.css          设计系统和响应式样式
      skills.career.js           方向定位 Skill
      skills.resume.js           简历诊断 Skill
      skills.interview.js        模拟面试 Skill
      skills.plan.js             行动计划 Skill
      skills.rewrite.js          Fact-Lock 简历改写 Skill
      skills.star.js             STAR 教练 Skill
      skills.pipeline.js         投递复盘 Skill
      skills.evidence.js         证据审计 Skill
      skills/
        manifest.schema.json     Skill manifest 草案
        _template.skill.js       新 Skill 接入模板
      tests/
        server.test.js
        model-gateway.test.js
        pipeline.test.js
        evidence.test.js
        onboarding.test.js
      docs/
        LLM_GATEWAY.md
      ARCHITECTURE.md
      .env.example
      package.json

---

## 测试

    npm test
    npm run check

测试覆盖：

- 静态文件路径安全和目录穿越拦截
- 模型请求输入边界
- 服务端健康检查
- 安全代理不向浏览器发送密钥
- 规则模式、直连模式和会话级密钥
- 投递复盘与周计划意图优先级
- 证据审计与补证计划路由
- 新用户首次引导与老用户状态迁移

---

## 安全与隐私

- API Key 不进入 Git，不写入 README 或前端日志
- 安全代理模式下浏览器不接触服务端密钥
- 静态直连模式的 Key 只存在当前标签页
- 服务端不持久化完整简历、面试回答或对话
- .env 已被 .gitignore 排除
- 外部岗位信息接入后必须带来源与抓取时间
- 自动投递、自动发邮件等外部写操作必须经过用户确认
- Agent 不得编造项目、头衔、奖项、数字和结果

---

## 当前范围与限制

已经实现：

- 可交互求职工作台
- 画像、证据、定位、简历、面试、投递与计划闭环
- 8 个专用 Skill 和通用对话兜底
- 安全模型网关与会话级直连模式
- 本地持久化和响应式界面
- 自动化测试与架构文档

尚未接入：

- 真实岗位搜索与招聘网站同步
- PDF / DOCX / OCR 简历解析
- 服务端用户认证和多端同步
- 语音面试、录音与转写
- 邮件和日历驱动的自动状态更新
- Offer 比较与正式谈判建议
- 生产级 PostgreSQL、pgvector 和任务队列

---

## 路线图

### P0：真实数据与账号

- 用户认证与云端数据同步
- PostgreSQL 状态存储和版本历史
- 岗位搜索、岗位来源引用和时效标记
- 流式模型响应、取消与成本预算

### P1：更强的求职闭环

- 邮件/日历联动投递状态
- 面试录音、转写和一键复盘
- Offer 对比与谈判准备
- 简历片段与证据 ID 双向引用

### P2：协作与生态

- Skill 开发协议和版本治理
- 校内就业中心知识库
- 导师/顾问协同
- 企业内推与活动连接
- 多端同步和主动提醒

详细设计见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

---

## 贡献方式

1. Fork 仓库并创建功能分支
2. 新增或修改 Skill 时同步更新测试
3. 不提交 .env、API Key、用户简历或真实个人信息
4. 提交 Pull Request，说明行为变化、测试结果和风险
5. 功能涉及外部写操作时，必须增加用户确认与回滚设计

欢迎通过 Issue 提交：

- 新的求职 Skill 建议
- 真实用户场景和失败案例
- 模型评测样本
- 数据模型和安全改进

---

## 版本记录

### v0.5.0

- 新增三步首次使用引导
- 新增画像、证据、投递和计划的 Markdown 档案导出
- 新用户首访自动进入个性化设置，老用户自动迁移不重复打扰
- 重置数据后可重新进入引导流程

### v0.4.0

- 新增证据库与 Fact-Lock 证据审计
- 新增 evidence-coach Skill
- 证据质量纳入职业定位和求职就绪度
- 新增证据编辑、删除、审计和补证任务闭环
- 更新架构、模型网关文档和自动化测试

### v0.3.0

- 新增投递看板、阶段流转和反馈记录
- 新增 pipeline-review Skill
- 投递进展纳入就绪度
- 新增投递路由测试和产品文档

### v0.2.0

- 新增安全模型网关和 /api/llm/complete
- 支持安全代理、浏览器直连和规则降级
- 修复 window.CareerOS 被覆盖的问题
- 新增模型状态、连接测试、健康检查和测试

### v0.1.0

- 建立工作台、画像、方向定位、简历、面试和行动计划基础框架
- 建立 Skill Registry、Intent Router 和统一返回协议

---

## License

当前仓库未声明开源许可证。对外复用、分发或商业使用前，请先与仓库所有者确认授权方式。
