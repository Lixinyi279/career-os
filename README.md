# 职途 Career OS

面向应届生的一站式求职 Agent 原型。当前版本聚焦产品骨架、画像驱动、Skill 编排和可交互闭环。

## 直接体验

直接用浏览器打开：

    outputs/career-agent/index.html

无需安装依赖，无需启动服务。

数据保存在当前浏览器的 localStorage。右上角“调整画像”可以替换演示数据；个人档案页可以重置。

## 已实现

- 工作台与求职就绪度
- 职业方向匹配和目标岗位锁定
- 个人画像与长期记忆
- 简历结构化诊断和 JD 对比
- 行为面、案例面、压力面训练
- 回答评分、反馈和训练报告
- 周计划生成、任务管理、计划导出
- Agent 对话和 4 个专用 Skill 路由
- Skill 权限声明与运行台
- 桌面与移动端响应式布局

## 文件结构

    career-agent/
      index.html
      assets/styles.css
      agent-core.js
      skills.career.js
      skills.resume.js
      skills.interview.js
      skills.plan.js
      app.js
      ARCHITECTURE.md
      skills/
        manifest.schema.json
        _template.skill.js

## Skill 扩展

Skill 通过全局注册表接入：

    window.CareerAgent.registry.register({
      manifest: {
        id: "job-search",
        name: "岗位搜索",
        version: "0.1.0",
        description: "根据画像检索并解释岗位匹配",
        permissions: ["profile:read", "jobs:read"],
        intents: ["job-search"],
        timeoutMs: 45000
      },
      match(message) {
        return /找工作|岗位推荐|招聘/.test(message);
      },
      async run(input, context) {
        return {
          text: "返回给用户的结果",
          actions: [],
          suggestions: []
        };
      }
    });

新增脚本后需要在 index.html 的 app.js 之前引入。生产版本不应使用全局注册表，应由服务端完成能力发现与权限校验。

## 调试

浏览器控制台可使用：

    window.CareerOS.state
    window.CareerOS.getReadiness()
    window.CareerOS.scoreResume(text, jd)
    window.CareerAgent.registry.list()

## 当前限制

- 使用规则适配器模拟 Agent 推理，没有真实大模型调用
- 面试语音、真实岗位抓取、PDF 解析尚未接入
- 数据仅保存在本机
- 诊断分数用于产品交互验证，不是正式招聘评估

生产化方案见 ARCHITECTURE.md。
