(function () {
  "use strict";

  const STORAGE_KEY = "career-os-state-v1";
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));
  const iconPaths = {
    "layout-dashboard": '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    "target": '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    "mic": '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    "calendar-check": '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    "user-round": '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    "blocks": '<rect width="7" height="7" x="14" y="3" rx="1"/><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "settings-2": '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    "menu": '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
    "sliders-horizontal": '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',
    "sparkles": '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    "x": '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    "link-2": '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
    "server": '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/> ',
    "brain-circuit": '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17 5v3"/><path d="M7 5v3"/>',
    "arrow-up": '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "circle": '<circle cx="12" cy="12" r="10"/>',
    "circle-check": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    "clock-3": '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16.5 12"/>',
    "flame": '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    "calendar-days": '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    "plus": '<path d="M5 12h14"/><path d="M12 5v14"/>',
    "briefcase": '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    "map-pin": '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    "coins": '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
    "trending-up": '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    "wand-sparkles": '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>',
    "upload": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    "scan-search": '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="11" cy="11" r="3"/><path d="m16 16-2.5-2.5"/>',
    "quote": '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
    "play": '<polygon points="6 3 20 12 6 21 6 3"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    "message-square": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    "download": '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    "trash-2": '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    "fingerprint": '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>',
    "lock": '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    "bookmark": '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    "info": '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>'
  };

  function icon(name, size) {
    const dimension = size || 18;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + dimension + '" height="' + dimension + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (iconPaths[name] || iconPaths.circle) +
      "</svg>"
    );
  }

  function hydrateIcons(root) {
    $$('[data-icon]', root || document).forEach((node) => {
      node.innerHTML = icon(node.getAttribute('data-icon'));
    });
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderRichText(value) {
    return escapeHTML(value)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  const CATEGORY = {
    resume: { label: "简历", color: "green" },
    research: { label: "岗位研究", color: "blue" },
    interview: { label: "面试", color: "orange" },
    network: { label: "人脉", color: "violet" },
    review: { label: "复盘", color: "gray" },
    application: { label: "投递", color: "rose" },
  };

  const PIPELINE_STAGES = [
    { id: "applied", label: "已投递", short: "投递", color: "blue" },
    { id: "assessment", label: "笔试 / 测评", short: "测评", color: "violet" },
    { id: "interview", label: "面试中", short: "面试", color: "orange" },
    { id: "offer", label: "Offer", short: "Offer", color: "green" },
    { id: "closed", label: "已结束", short: "结束", color: "gray" },
  ];

  const VIEW_META = {
    dashboard: { root: "工作台", current: "今日推进" },
    positioning: { root: "方向定位", current: "目标与证据" },
    resume: { root: "简历工坊", current: "诊断与改写" },
    evidence: { root: "证据库", current: "事实与素材" },
    jobs: { root: "岗位研究", current: "JD 与证据匹配" },
    pipeline: { root: "投递看板", current: "进程与反馈" },
    interview: { root: "模拟面试", current: "训练与反馈" },
    plan: { root: "行动计划", current: "本周主线" },
    profile: { root: "个人档案", current: "画像与偏好" },
  };

  const defaultResume = [
    "林知夏 | 信息管理与信息系统 | 2027 届",
    "求职方向：互联网产品运营 / 数据产品",
    "",
    "教育经历",
    "华东某高校 | 信息管理与信息系统 | 本科 | 2023.09 - 2027.06",
    "主修课程：数据库、统计学、用户研究、项目管理",
    "",
    "项目经历",
    "校园二手交易平台 | 产品负责人 | 2026.03 - 2026.06",
    "负责需求调研、功能规划和活动运营，组织 4 人团队完成小程序一期上线。",
    "通过社群推广和校园摊位获取早期用户，累计注册 1,200 人，日活约 180 人。",
    "设计商品分类与信用评价机制，根据访谈反馈迭代 2 个版本。",
    "",
    "数据分析课程项目 | 核心成员 | 2025.09 - 2025.12",
    "使用 Python 清洗 3 万条公开评论数据，完成主题聚类和可视化报告。",
    "从评论中提炼 5 类用户关注点，课程展示获得小组第一名。",
    "",
    "校园经历",
    "学生会新媒体部 | 内容策划 | 2024.09 - 2025.06",
    "负责公众号选题与排版，单篇最高阅读量 4,600。",
    "",
    "技能",
    "Python、SQL、Excel、Figma、基础数据分析、内容运营",
  ].join("\n");

  const defaultJD = [
    "产品运营实习生",
    "岗位职责：",
    "1. 负责用户需求分析与运营策略设计，推动产品功能落地；",
    "2. 通过数据分析定位问题，设计 A/B 实验并复盘效果；",
    "3. 协同产品、设计和研发团队，持续优化用户体验；",
    "4. 跟踪核心指标，输出运营报告和增长建议。",
    "任职要求：",
    "1. 逻辑清晰，具备数据分析能力和用户洞察；",
    "2. 有项目推动经验，能跨团队协作；",
    "3. 熟悉 SQL、Excel 或常见分析工具。",
  ].join("\n");

  function createDefaultState() {
    return {
      version: 3,
      onboardingComplete: false,
      profile: {
        name: "林知夏",
        school: "华东某高校",
        major: "信息管理与信息系统",
        gradYear: "2027",
        targetTrack: "产品 / 数据",
        cities: "上海、杭州",
        weeklyHours: 14,
        experienceLevel: "1 段校园产品项目",
        strongest: "用户研究、跨团队协作",
        constraints: "秋招前需要完成毕业设计；不接受长期 996。",
        targetCompany: "互联网 / SaaS / 消费科技",
      },
      readiness: { positioning: 72, resume: 58, interview: 36, pipeline: 24 },
      tasks: [
        { id: "t1", day: "今天", title: "用 STAR 重写校园二手平台经历", detail: "补上目标、行动和可验证结果，控制在 5 行内。", category: "resume", duration: 25, done: false, priority: "P0" },
        { id: "t2", day: "今天", title: "拆解 3 个产品运营 JD 的共性要求", detail: "记录高频能力词与业务场景，形成岗位样本表。", category: "research", duration: 30, done: false, priority: "P0" },
        { id: "t3", day: "明天", title: "做一次 20 分钟行为面录音", detail: "回答项目冲突题，回听并标记无效表达。", category: "interview", duration: 20, done: false, priority: "P1" },
        { id: "t4", day: "周三", title: "把简历投给 2 个低风险岗位", detail: "优先选择相似度 70%-80% 的岗位测试反馈。", category: "application", duration: 20, done: false, priority: "P1" },
        { id: "t5", day: "周四", title: "找 1 位行业前辈做信息访谈", detail: "准备 3 个问题：日常、考核、成长路径。", category: "network", duration: 35, done: false, priority: "P2" },
        { id: "t6", day: "周五", title: "复盘投递与面试反馈", detail: "区分简历问题、方向问题与表达问题。", category: "review", duration: 25, done: false, priority: "P1" },
        { id: "t7", day: "周日", title: "更新下周求职策略", detail: "依据反馈决定继续、收窄或切换方向。", category: "review", duration: 30, done: false, priority: "P1" },
      ],
      applications: [
        { id: "app-1", company: "云帆科技", role: "产品运营实习生", city: "上海", stage: "interview", source: "公司官网", appliedAt: "2026-10-22", nextAction: "准备二面案例分析", nextAt: "2026-11-04", fit: 86, notes: "一面重点追问用户增长和指标解释，面试官偏业务型。", feedback: "一面通过：项目真实度认可，数据归因需要补强。", createdAt: "2026-10-22T09:30:00.000Z", updatedAt: "2026-10-30T12:10:00.000Z" },
        { id: "app-2", company: "拾光数据", role: "数据产品实习生", city: "杭州", stage: "assessment", source: "校园招聘", appliedAt: "2026-10-27", nextAction: "完成在线测评", nextAt: "2026-11-03", fit: 79, notes: "岗位偏数据平台，需补需求抽象案例。", feedback: "", createdAt: "2026-10-27T05:20:00.000Z", updatedAt: "2026-10-29T08:40:00.000Z" },
        { id: "app-3", company: "北辰互动", role: "用户运营", city: "上海", stage: "applied", source: "内推", appliedAt: "2026-10-31", nextAction: "跟进内推状态", nextAt: "2026-11-05", fit: 75, notes: "内推人建议突出社群运营与用户访谈。", feedback: "", createdAt: "2026-10-31T03:00:00.000Z", updatedAt: "2026-10-31T03:00:00.000Z" },
        { id: "app-4", company: "远山咨询", role: "研究助理", city: "远程", stage: "closed", source: "招聘平台", appliedAt: "2026-10-14", nextAction: "归档复盘", nextAt: "", fit: 58, notes: "岗位要求定量研究深度高于当前证据。", feedback: "简历未通过：研究方法和统计项目需要更具体。", createdAt: "2026-10-14T10:00:00.000Z", updatedAt: "2026-10-23T07:30:00.000Z" }
      ],
      evidence: [
        { id: "evidence-1", title: "校园二手交易平台", type: "项目", role: "产品负责人", period: "2026.03 - 2026.06", situation: "校内二手交易信息分散在多个社群，发布、检索和信任判断成本都很高。", action: "访谈 18 位目标用户，砍掉两个低优先级功能，设计商品分类和信用评价机制，并组织 4 人团队完成一期上线。", result: "上线 6 周获得 1,200 名注册用户，日活约 180 人，核心发布流程完成率高于旧表单方案。", metrics: ["1,200 注册用户", "180 日活", "4 人团队"], skills: ["用户研究", "需求分析", "项目推动"], confidence: 84, updatedAt: "2026-10-30T12:00:00.000Z" },
        { id: "evidence-2", title: "评论数据主题分析", type: "课程项目", role: "核心成员", period: "2025.09 - 2025.12", situation: "课程要求从公开评论中识别用户关注点，并输出可解释的分析结论。", action: "使用 Python 清洗 3 万条评论，完成主题聚类、词频分析和可视化，并在展示前与两位同学交叉校验标签。", result: "提炼 5 类用户关注点，项目展示获得小组第一名。", metrics: ["3 万条数据", "5 类主题", "小组第一"], skills: ["Python", "数据分析", "可视化"], confidence: 76, updatedAt: "2026-10-28T08:30:00.000Z" },
        { id: "evidence-3", title: "校园公众号内容运营", type: "校园经历", role: "内容策划", period: "2024.09 - 2025.06", situation: "部门公众号阅读量不稳定，选题依赖临时讨论，缺少固定复盘。", action: "负责选题、采访、排版和发布节奏，整理高阅读内容共性，并尝试固定栏目。", result: "累计发布 30 篇推文，单篇最高阅读量 4,600。", metrics: ["30 篇推文", "最高阅读 4,600"], skills: ["内容运营", "选题策划", "编辑排版"], confidence: 68, updatedAt: "2026-10-25T06:10:00.000Z" },
        { id: "evidence-4", title: "学生会活动统筹", type: "校园经历", role: "项目成员", period: "2024.03 - 2024.05", situation: "需要在有限预算下组织跨院系活动，并协调宣传、场地和志愿者。", action: "拆分任务和截止时间，维护共享进度表，处理场地变更和物料延迟。", result: "活动按计划完成，现场参与约 260 人。", metrics: ["260 人参与", "跨院系协作"], skills: ["项目协调", "沟通", "执行"], confidence: 61, updatedAt: "2026-10-24T09:00:00.000Z" }
      ],
      roles: [
        { id: "product-ops", title: "产品运营", track: "互联网 / SaaS", fit: 84, salary: "14-22K", status: "主攻", selected: true, why: "项目经历与用户研究能力可直接迁移，岗位样本多，适合作为秋招主线。", gaps: ["指标体系", "A/B 实验"] },
        { id: "data-product", title: "数据产品", track: "企业服务 / 消费科技", fit: 79, salary: "16-24K", status: "第二方向", selected: false, why: "信息管理背景与 SQL 能力匹配，但需要补一个完整的数据产品案例。", gaps: ["需求抽象", "数据建模"] },
        { id: "user-research", title: "用户研究", track: "互联网 / 咨询", fit: 73, salary: "13-20K", status: "观察", selected: false, why: "访谈和洞察是优势，但岗位数量更少，对方法论深度要求更高。", gaps: ["研究方法", "样本设计"] },
        { id: "ai-product", title: "AI 产品运营", track: "AI 应用 / 工具", fit: 68, salary: "15-23K", status: "探索", selected: false, why: "增长快且与内容运营相通，但需要补充 AI 产品理解与评测经验。", gaps: ["AI 产品认知", "提示词评测"] },
      ],
      jobTargets: [
        { id: "job-1", company: "云帆科技", role: "产品运营实习生", city: "上海", source: "公司官网", deadline: "2026-11-10", priority: "P0", status: "active", jd: "负责用户增长与活动运营；通过用户研究、数据分析和 A/B 实验优化核心指标；协同产品、设计和研发推动方案落地；输出运营复盘与增长建议。", notes: "已进入二面，岗位偏业务增长，需要强化指标解释。" },
        { id: "job-2", company: "拾光数据", role: "数据产品实习生", city: "杭州", source: "校园招聘", deadline: "2026-11-08", priority: "P0", status: "active", jd: "参与数据产品需求分析与原型设计；使用 SQL 和 Excel 完成数据验证；理解数据模型与 API；与研发协作推动数据平台功能上线。", notes: "需要补 SQL 和需求抽象的案例。" },
        { id: "job-3", company: "北辰互动", role: "用户运营", city: "上海", source: "内推", deadline: "2026-11-12", priority: "P1", status: "active", jd: "负责用户社群运营、内容策划和活动执行；通过用户访谈与数据分析识别需求；提升用户活跃、留存和转化；与内容及产品团队协同。", notes: "内推人建议突出社群与用户洞察。" },
        { id: "job-4", company: "远山咨询", role: "研究助理", city: "远程", source: "招聘平台", deadline: "2026-10-20", priority: "P2", status: "archived", jd: "支持定量与定性研究项目；完成问卷设计、访谈记录、数据清洗和研究报告；要求较强的统计分析与沟通能力。", notes: "已结束，反馈是研究方法证据不足。" }
      ],
      resume: {
        text: defaultResume,
        targetJD: defaultJD,
        fileName: "林知夏_产品运营_简历_v3.txt",
        score: 58,
        dimensions: [
          { label: "结构清晰", value: 74 },
          { label: "成果量化", value: 46 },
          { label: "岗位相关", value: 62 },
          { label: "表达密度", value: 51 },
        ],
        issues: ["项目经历里的职责描述偏多，结果和决策过程偏少。", "目标 JD 中的分析、实验、指标等关键词覆盖不足。", "第一屏没有直接说明求职方向与最强证据。"],
        lastReviewed: "2026-10-29T10:00:00.000Z",
      },
      interview: {
        mode: "behavior",
        intensity: "standard",
        started: false,
        done: false,
        index: 0,
        score: 0,
        history: [],
      },
      messages: [
        {
          role: "assistant",
          text: "早上好，知夏。我看过你的画像和昨天进度：方向已经收窄到「产品运营」，当前最大的瓶颈不是信息不足，而是项目经历里缺少可验证的结果证据。\n\n今天先完成简历改写，再做一次岗位样本校验。我会根据你的完成情况继续调整计划。",
          time: "09:12",
          actions: [{ label: "查看今日主线", view: "dashboard" }, { label: "打开简历工坊", view: "resume" }],
        },
      ],
      suggestions: ["判断岗位方向", "诊断我的简历", "安排本周计划"],
      memory: [
        { type: "preference", content: "优先上海、杭州；希望工作有成长密度，但不接受长期 996。", createdAt: "2026-10-27T09:00:00.000Z" },
        { type: "goal", content: "2027 届秋招主攻互联网产品运营，数据产品为第二方向。", createdAt: "2026-10-27T09:02:00.000Z" },
      ],
      planVersion: 3,
      activity: [],
    };
  }

  function mergeState(saved) {
    const fresh = createDefaultState();
    if (!saved || typeof saved !== "object") return fresh;
    const state = Object.assign({}, fresh, saved);
    state.profile = Object.assign({}, fresh.profile, saved.profile || {});
    state.resume = Object.assign({}, fresh.resume, saved.resume || {});
    state.interview = Object.assign({}, fresh.interview, saved.interview || {});
    state.readiness = Object.assign({}, fresh.readiness, saved.readiness || {});
    state.tasks = Array.isArray(saved.tasks) && saved.tasks.length ? saved.tasks : fresh.tasks;
    state.roles = Array.isArray(saved.roles) && saved.roles.length ? saved.roles : fresh.roles;
    state.applications = Array.isArray(saved.applications) ? saved.applications : fresh.applications;
    state.evidence = Array.isArray(saved.evidence) ? saved.evidence : fresh.evidence;
    state.jobTargets = Array.isArray(saved.jobTargets) ? saved.jobTargets : fresh.jobTargets;
    state.messages = Array.isArray(saved.messages) ? saved.messages : fresh.messages;
    state.memory = Array.isArray(saved.memory) ? saved.memory : fresh.memory;
    if (!Object.prototype.hasOwnProperty.call(saved, "onboardingComplete")) state.onboardingComplete = true;
    state.suggestions = Array.isArray(saved.suggestions) ? saved.suggestions : fresh.suggestions;
    return state;
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return mergeState(raw ? JSON.parse(raw) : null);
    } catch (error) {
      console.warn("[CareerOS] localStorage unavailable", error);
      return createDefaultState();
    }
  }

  const state = loadState();
  const ui = {
    view: "dashboard",
    typing: false,
    suggestions: state.suggestions.slice(),
    planFilter: "all",
    sidebarOpen: false,
    agentOpen: false,
    onboardingStep: 0,
    onboardingDraft: null,
  };

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("[CareerOS] could not persist state", error);
    }
  }

  function profileCompleteness(profile) {
    const fields = [
      profile.name,
      profile.school,
      profile.major,
      profile.gradYear,
      profile.targetTrack,
      profile.cities,
      profile.weeklyHours,
      profile.experienceLevel,
      profile.strongest,
      profile.constraints,
      profile.targetCompany,
    ];
    return Math.round((fields.filter((value) => String(value || "").trim()).length / fields.length) * 100);
  }

  function taskCompletion() {
    if (!state.tasks.length) return 0;
    return Math.round((state.tasks.filter((task) => task.done).length / state.tasks.length) * 100);
  }

  function getReadiness() {
    const completeness = profileCompleteness(state.profile);
    const selectedRole = state.roles.some((role) => role.selected);
    const evidence = Array.isArray(state.evidence) ? state.evidence : [];
    const evidenceQuality = evidence.length ? evidence.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / evidence.length : 0;
    const evidenceCoverage = Math.min(12, evidence.length * 2.5);
    const positioning = Math.min(94, Math.round(30 + completeness * 0.3 + (selectedRole ? 6 : 0) + evidenceQuality * 0.15 + evidenceCoverage));
    const resume = Math.max(20, Math.min(94, state.resume.score || 34));
    const interview = Math.max(18, Math.min(92, state.interview.score || 28));
    const applications = Array.isArray(state.applications) ? state.applications : [];
    const activeApplications = applications.filter((item) => item.stage !== "closed").length;
    const progressedApplications = applications.filter((item) => ["assessment", "interview", "offer"].includes(item.stage)).length;
    const feedbackApplications = applications.filter((item) => String(item.feedback || "").trim()).length;
    const pipeline = Math.max(16, Math.min(94, 14 + Math.round(taskCompletion() * 0.32) + Math.min(28, activeApplications * 4 + progressedApplications * 5) + Math.min(16, feedbackApplications * 4)));
    return {
      positioning: positioning,
      resume: resume,
      interview: interview,
      pipeline: pipeline,
      total: Math.round((positioning + resume + interview + pipeline) / 4),
      completeness: completeness,
    };
  }

  function getCurrentStage() {
    const readiness = getReadiness();
    if (readiness.positioning < 62) return 0;
    if (readiness.resume < 68) return 2;
    if (readiness.interview < 65) return 3;
    return 4;
  }

  function nextTask() {
    return state.tasks.find((task) => !task.done) || null;
  }

  function makeId(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
  }

  function nowTime() {
    return new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  function formatDate(value) {
    if (!value) return "尚未运行";
    return new Date(value).toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }

  function generatePlan(profile, currentTasks) {
    const hours = Number(profile.weeklyHours) || 10;
    const track = String(profile.targetTrack || "产品");
    const count = hours <= 5 ? 3 : hours <= 9 ? 4 : hours <= 14 ? 5 : 6;
    const base = [
      { day: "今天", title: "重写主项目的成果证据", detail: "按目标-行动-结果重写，至少补 2 个数字或可验证结果。", category: "resume", duration: 25, priority: "P0" },
      { day: "今天", title: "建立 3 个目标岗位样本", detail: "提取高频职责、能力词与业务场景，写进岗位对比表。", category: "research", duration: 30, priority: "P0" },
      { day: "明天", title: "完成一次 15 分钟行为面录音", detail: "回答最有挑战的项目题，复盘结构而非追求标准答案。", category: "interview", duration: 20, priority: "P1" },
      { day: "周三", title: "投递 2 个验证型岗位", detail: "选择匹配度适中、反馈速度快的岗位，验证简历方向。", category: "application", duration: 20, priority: "P1" },
      { day: "周四", title: "做一次行业信息访谈", detail: "向从业者确认日常工作、考核方式和成长路径。", category: "network", duration: 30, priority: "P2" },
      { day: "周日", title: "复盘反馈并更新策略", detail: "区分方向、简历、面试三类问题，只改一个主变量。", category: "review", duration: 25, priority: "P1" },
    ];
    const tasks = base.slice(0, count).map((task, index) => {
      const previous = currentTasks && currentTasks[index];
      return Object.assign({}, task, { id: makeId("plan"), done: Boolean(previous && previous.done) });
    });
    return { tasks: tasks, focus: /数据/.test(track) ? "数据分析" : "业务结果" };
  }

  function renderShell() {
    const readiness = getReadiness();
    const firstName = String(state.profile.name || "同学").replace(/同学$/, "");
    $("#sidebar-user-name").textContent = state.profile.name || "同学";
    $("#sidebar-avatar").textContent = firstName.slice(0, 1) || "职";
    $("#sidebar-completeness").textContent = readiness.completeness + "%";
    $("#resume-nav-count").textContent = String(state.resume.score || 0);
    $("#pipeline-nav-count").textContent = String((state.applications || []).filter((item) => item.stage !== "closed").length);
    $("#evidence-nav-count").textContent = String((state.evidence || []).length);
    $("#jobs-nav-count").textContent = String((state.jobTargets || []).filter((item) => item.status !== "archived").length);
    $("#agent-context-title").textContent = state.profile.gradYear + " 届 · " + state.profile.targetTrack;
    $("#agent-context-completeness").textContent = "画像 " + readiness.completeness + "%";
    $("#agent-context-hours").textContent = "本周 " + state.profile.weeklyHours + "h";
    $("#agent-context-cities").textContent = state.profile.cities;
    const meta = VIEW_META[ui.view] || VIEW_META.dashboard;
    $("#breadcrumb-root").textContent = meta.root;
    $("#breadcrumb-current").textContent = meta.current;
    const skillCount = window.CareerAgent.registry.list().length + 1;
    $("#skill-status-title").textContent = skillCount + " 个 Skills 在线";
    renderModelStatus();

    $$(".nav-item").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-view") === ui.view);
    });
    $$(".mobile-nav-item[data-view]").forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-view") === ui.view);
    });
    $(".sidebar").classList.toggle("is-open", ui.sidebarOpen);
    $(".agent-panel").classList.toggle("is-open", ui.agentOpen);
    document.body.classList.toggle("has-overlay", ui.agentOpen || ui.sidebarOpen || Boolean($("#modal-root").innerHTML));
  }

  function renderModelStatus() {
    const pill = $("#model-mode-pill");
    if (!pill || !window.CareerOS || !window.CareerOS.llm) return;
    const status = window.CareerOS.llm.getServerStatus();
    const cfg = window.CareerOS.llm.getConfig();
    const direct = Boolean(cfg.apiKey && cfg.baseUrl && cfg.model);
    let mode = "rules";
    let label = "本地规则";
    if (status.llmConfigured) {
      mode = "server";
      label = "安全 AI";
    } else if (direct) {
      mode = "direct";
      label = "直连 AI";
    }
    pill.className = "model-mode-pill is-" + mode;
    pill.innerHTML = icon(mode === "rules" ? "brain-circuit" : "sparkles", 14) + "<span>" + label + "</span>";
    const subtitle = $("#skill-status-subtitle");
    if (subtitle) {
      subtitle.textContent = mode === "server" ? "服务端模型网关已连接" : mode === "direct" ? "浏览器临时直连模式" : "规则引擎与本地知识";
    }
  }

  function render() {
    renderShell();

    renderView();
    renderAgent();
    hydrateIcons(document);
  }

  function renderView() {
    const renderers = {
      dashboard: renderDashboard,
      positioning: renderPositioning,
      resume: renderResume,
      evidence: renderEvidence,
      jobs: renderJobs,
      pipeline: renderPipeline,
      interview: renderInterview,
      plan: renderPlan,
      profile: renderProfile,
    };
    const main = $("#main-content");
    main.innerHTML = (renderers[ui.view] || renderDashboard)();
    main.scrollTop = 0;
    hydrateIcons(main);
  }

  function renderAgent() {
    const container = $("#agent-messages");
    const messages = state.messages.slice(-12);
    const html = messages.map((message) => {
      const role = message.role === "user" ? "user" : "assistant";
      const actions = actionButtons(message.actions || [], "message-action");
      if (role === "user") {
        return '<article class="message message-user"><div class="message-bubble">' + renderRichText(message.text) + '</div><span class="message-meta">' + escapeHTML(message.time || "") + '</span></article>';
      }
      return (
        '<article class="message message-assistant">' +
        '<div class="message-author"><span class="message-avatar">' + icon("sparkles", 15) + '</span><span>职途 Agent</span></div>' +
        '<div class="message-bubble">' + renderRichText(message.text) + '</div>' +
        (actions ? '<div class="message-actions">' + actions + '</div>' : '') +
        '<span class="message-meta">' + escapeHTML(message.time || "") + (message.skillId ? " · " + escapeHTML(message.skillId) : "") + '</span>' +
        '</article>'
      );
    }).join("");

    const typing = ui.typing
      ? '<article class="message message-assistant message-typing"><div class="message-author"><span class="message-avatar">' + icon("sparkles", 15) + '</span><span>职途 Agent</span></div><div class="typing-dots"><i></i><i></i><i></i></div></article>'
      : "";

    container.innerHTML = html + typing;
    const suggestions = (ui.suggestions && ui.suggestions.length ? ui.suggestions : ["我可以先做什么", "查看本周计划", "重新评估方向"]).slice(0, 3);
    $("#agent-suggestions").innerHTML = suggestions
      .map((prompt) => '<button class="suggestion-chip" data-prompt="' + escapeHTML(prompt) + '">' + escapeHTML(prompt) + '</button>')
      .join("");
    hydrateIcons(container);
    hydrateIcons($("#agent-suggestions"));
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }

  function actionButtons(actions, className) {
    return actions.map((action) => {
      if (action.view) {
        return '<button class="' + className + '" data-view="' + escapeHTML(action.view) + '">' + escapeHTML(action.label) + icon("arrow-right", 13) + '</button>';
      }
      return '<button class="' + className + '" data-action="' + escapeHTML(action.action) + '">' + escapeHTML(action.label) + '</button>';
    }).join("");
  }

  function pageHeading(kicker, title, description, actionHTML) {
    return (
      '<header class="page-heading">' +
      '<div><span class="eyebrow">' + escapeHTML(kicker) + '</span><h1>' + escapeHTML(title) + '</h1><p>' + escapeHTML(description) + '</p></div>' +
      '<div class="page-heading-actions">' + (actionHTML || "") + '</div>' +
      '</header>'
    );
  }

  function renderTaskRow(task, compact) {
    const category = CATEGORY[task.category] || CATEGORY.review;
    return (
      '<div class="task-row' + (task.done ? " is-done" : "") + '">' +
      '<button class="task-check" data-task-toggle="' + escapeHTML(task.id) + '" aria-label="' + (task.done ? "标记未完成" : "标记完成") + '">' +
      (task.done ? icon("check", 14) : "") +
      '</button>' +
      '<div class="task-copy">' +
      '<div class="task-title-row"><strong>' + escapeHTML(task.title) + '</strong>' +
      (task.priority === "P0" ? '<span class="priority-dot">P0</span>' : "") + '</div>' +
      (compact ? "" : '<p>' + escapeHTML(task.detail) + '</p>') +
      '<div class="task-meta"><span class="category-dot category-' + category.color + '"></span><span>' + escapeHTML(category.label) + '</span><span>' + escapeHTML(task.day) + '</span><span>' + task.duration + ' min</span></div>' +
      '</div>' +
      '<button class="row-icon-button" data-action="focus-task" data-task-id="' + escapeHTML(task.id) + '" aria-label="查看任务">' + icon("chevron-right", 16) + '</button>' +
      '</div>'
    );
  }

  function renderDashboard() {
    const readiness = getReadiness();
    const currentTask = nextTask();
    const selectedRole = state.roles.find((role) => role.selected) || state.roles[0];
    const completed = state.tasks.filter((task) => task.done).length;
    const interviewHistory = state.interview.history.length;
    const activeApplications = (state.applications || []).filter((item) => item.stage !== "closed");
    const pipelineFeedback = (state.applications || []).filter((item) => String(item.feedback || "").trim()).length;
    const stage = getCurrentStage();
    const steps = [
      { title: "职业定位", detail: "画像与方向", score: readiness.positioning },
      { title: "目标锁定", detail: "岗位与策略", score: selectedRole ? selectedRole.fit : 0 },
      { title: "简历准备", detail: "证据与改写", score: readiness.resume },
      { title: "面试训练", detail: "表达与压力", score: readiness.interview },
      { title: "投递复盘", detail: "反馈与迭代", score: readiness.pipeline },
    ];

    const html = [];
    html.push('<div class="view view-dashboard">');
    html.push(pageHeading(
      "2027 秋招 · 第 06 周",
      "把不确定性，拆成下一步。",
      "你的主线是 " + state.profile.targetTrack + "。Agent 已结合画像、简历与本周时间，把任务压缩到最重要的几项。",
      '<button class="button button-secondary" data-action="open-profile">' + icon("sliders-horizontal", 16) + '<span>调整画像</span></button><button class="button button-primary" data-action="open-agent">' + icon("sparkles", 16) + '<span>和 Agent 校准方案</span></button>'
    ));
    if (!state.onboardingComplete) {
      html.push(
        '<section class="onboarding-banner"><div class="onboarding-banner-mark">' + icon("sparkles", 20) + '</div><div><span class="section-kicker">第一次使用</span><h2>用 3 分钟建立你的求职主线。</h2><p>补全背景、方向和现实约束，Agent 会生成第一版计划。也可以先浏览现有示例。</p></div><button class="button button-primary" data-action="start-onboarding">开始个性化' + icon("arrow-right", 15) + '</button></section>'
      );
    }
    html.push('<div class="dashboard-grid">');

    html.push(
      '<section class="focus-band">' +
      '<div class="focus-band-copy">' +
      '<div class="section-kicker"><span class="live-dot"></span> 当前主线</div>' +
      '<h2>' + escapeHTML(selectedRole.title) + '<span class="focus-slash">/</span><span class="focus-soft">秋招主攻</span></h2>' +
      '<p>匹配度 ' + selectedRole.fit + '%，已有证据可以迁移。先补齐业务结果与指标意识，再扩大投递面。</p>' +
      '<div class="focus-band-actions"><button class="button button-dark" data-view="positioning">查看判断依据' + icon("arrow-right", 15) + '</button><span class="focus-version">方案 v' + state.planVersion + ' · 昨日更新</span></div>' +
      '</div>' +
      '<div class="readiness-block">' +
      '<div class="readiness-ring" style="--score:' + readiness.total + '"><div><strong>' + readiness.total + '</strong><span>求职就绪度</span></div></div>' +
      '<div class="readiness-breakdown">' +
      '<div><span>方向清晰</span><b>' + readiness.positioning + '</b></div>' +
      '<div><span>材料准备</span><b>' + readiness.resume + '</b></div>' +
      '<div><span>面试状态</span><b>' + readiness.interview + '</b></div>' +
      '<div><span>市场反馈</span><b>' + readiness.pipeline + '</b></div>' +
      '</div></div>' +
      '</section>'
    );

    html.push(
      '<section class="card next-action-card">' +
      '<div class="card-heading"><div><span class="section-kicker">下一步行动</span><h3>只做最重要的一件事</h3></div><span class="time-badge">' + (currentTask ? currentTask.duration + " min" : "已完成") + '</span></div>' +
      (currentTask
        ? '<div class="next-action-content"><div class="action-number">01</div><div><h4>' + escapeHTML(currentTask.title) + '</h4><p>' + escapeHTML(currentTask.detail) + '</p><div class="task-meta"><span class="category-dot category-' + CATEGORY[currentTask.category].color + '"></span><span>' + CATEGORY[currentTask.category].label + '</span><span>' + escapeHTML(currentTask.day) + '</span></div></div></div><button class="button button-primary button-wide" data-task-toggle="' + currentTask.id + '">' + icon("check", 16) + '完成这个动作</button>'
        : '<div class="empty-state compact"><span>' + icon("circle-check", 22) + '</span><p>本周主线已全部完成</p><button class="button button-secondary" data-action="generate-plan">生成下一周计划</button></div>') +
      '</section>'
    );

    html.push(
      '<section class="card journey-card">' +
      '<div class="card-heading"><div><span class="section-kicker">求职路径</span><h3>从定位到反馈的闭环</h3></div><button class="text-button" data-view="plan">查看完整计划' + icon("arrow-right", 14) + '</button></div>' +
      '<div class="journey-track">' +
      steps.map((step, index) => {
        const done = index < stage;
        const active = index === stage;
        return '<button class="journey-step' + (done ? " is-done" : "") + (active ? " is-active" : "") + '" data-view="' + (index === 0 ? "positioning" : index === 2 ? "resume" : index === 3 ? "interview" : index === 4 ? "plan" : "positioning") + '">' +
          '<span class="journey-index">' + (done ? icon("check", 13) : String(index + 1).padStart(2, "0")) + '</span>' +
          '<span class="journey-copy"><strong>' + step.title + '</strong><small>' + step.detail + '</small></span>' +
          '<span class="journey-score">' + step.score + '</span>' +
          '</button>';
      }).join("") +
      '</div></section>'
    );

    html.push(
      '<section class="card roles-card">' +
      '<div class="card-heading"><div><span class="section-kicker">岗位匹配</span><h3>先用数据收窄方向</h3></div><button class="text-button" data-view="positioning">全部岗位' + icon("arrow-right", 14) + '</button></div>' +
      '<div class="role-table">' + state.roles.map((role) => {
        return '<button class="role-row" data-role-lock="' + role.id + '">' +
          '<span class="role-title"><strong>' + escapeHTML(role.title) + '</strong><small>' + escapeHTML(role.track) + '</small></span>' +
          '<span class="fit-cell"><span class="fit-track"><i style="width:' + role.fit + '%"></i></span><b>' + role.fit + '%</b></span>' +
          '<span class="role-status ' + (role.selected ? "is-selected" : "") + '">' + (role.selected ? "已锁定" : escapeHTML(role.status)) + '</span>' +
          '</button>';
      }).join("") + '</div>' +
      '</section>'
    );

    html.push(
      '<section class="card tasks-card">' +
      '<div class="card-heading"><div><span class="section-kicker">本周推进</span><h3>' + completed + ' / ' + state.tasks.length + ' 个关键动作</h3></div><button class="icon-button soft" data-action="open-task" aria-label="新增任务">' + icon("plus", 17) + '</button></div>' +
      '<div class="mini-progress"><span style="width:' + taskCompletion() + '%"></span></div>' +
      '<div class="task-list compact-list">' + state.tasks.slice(0, 4).map((task) => renderTaskRow(task, true)).join("") + '</div>' +
      '<button class="text-button full-width" data-view="plan">管理全部任务' + icon("arrow-right", 14) + '</button>' +
      '</section>'
    );

    html.push(
      '<section class="card pipeline-pulse">' +
      '<div class="pipeline-pulse-main"><div class="pulse-icon">' + icon("briefcase", 19) + '</div><div><span class="section-kicker">投递反馈环</span><h3>' + activeApplications.length + ' 条流程仍在推进</h3><p>' + (pipelineFeedback ? '已经收到 ' + pipelineFeedback + ' 条明确反馈。下一步优先处理最近截止的记录，而不是盲目增加投递量。' : '还没有足够反馈样本。先记录真实进展，再决定是否扩展岗位范围。') + '</p></div></div>' +
      '<div class="pipeline-pulse-stats">' +
      '<div><strong>' + activeApplications.filter((item) => item.stage === "assessment").length + '</strong><span>测评</span></div>' +
      '<div><strong>' + activeApplications.filter((item) => item.stage === "interview").length + '</strong><span>面试</span></div>' +
      '<div><strong>' + (state.applications || []).filter((item) => item.stage === "offer").length + '</strong><span>Offer</span></div>' +
      '<button class="text-button" data-view="pipeline">管理投递' + icon("arrow-right", 14) + '</button>' +
      '</div></section>'
    );

    html.push(
      '<section class="card insight-card">' +
      '<div class="insight-mark">' + icon("quote", 22) + '</div>' +
      '<div><span class="section-kicker">Agent 观察</span><h3>你的问题不是经历少，而是证据没有被翻译成岗位语言。</h3><p>信息管理背景、用户访谈和项目推动能力都能迁移到产品运营。下一次改写时，把“做了什么”换成“在什么约束下做了哪个决策，带来了什么变化”。</p><button class="button button-secondary" data-prompt="帮我分析能力缺口并给一个改写例子">继续分析能力缺口</button></div>' +
      '</section>'
    );

    html.push('</div></div>');
    return html.join("");
  }

  function pipelineStage(stageId) {
    return PIPELINE_STAGES.find((stage) => stage.id === stageId) || PIPELINE_STAGES[0];
  }

  function formatCalendarDate(value) {
    if (!value) return "未设置";
    const date = new Date(value + "T00:00:00");
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }

  function isPastDate(value) {
    if (!value) return false;
    const date = new Date(value + "T23:59:59");
    return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
  }

  function renderApplicationCard(application) {
    const stageIndex = PIPELINE_STAGES.findIndex((stage) => stage.id === application.stage);
    const canAdvance = stageIndex >= 0 && stageIndex < PIPELINE_STAGES.length - 1;
    const nextLabel = application.stage === "offer" ? "完成流程" : application.stage === "interview" ? "记录 Offer" : "推进阶段";
    const dueTone = isPastDate(application.nextAt) && application.stage !== "closed" ? " is-overdue" : "";
    return (
      '<article class="application-card stage-' + escapeHTML(application.stage) + '">' +
      '<div class="application-card-head"><div><strong>' + escapeHTML(application.company) + '</strong><p>' + escapeHTML(application.role) + '</p></div><span class="application-fit">' + Number(application.fit || 0) + '%</span></div>' +
      '<div class="application-tags"><span>' + escapeHTML(application.city || "地点待定") + '</span><span>' + escapeHTML(application.source || "来源未填") + '</span></div>' +
      (application.nextAction ? '<div class="application-next' + dueTone + '"><span>' + icon("clock-3", 13) + '</span><div><small>下一步</small><strong>' + escapeHTML(application.nextAction) + '</strong><p>' + formatCalendarDate(application.nextAt) + '</p></div></div>' : "") +
      (application.feedback ? '<p class="application-feedback">' + escapeHTML(application.feedback) + '</p>' : "") +
      '<div class="application-card-actions">' +
      (canAdvance ? '<button class="mini-button" data-action="advance-application" data-application-id="' + escapeHTML(application.id) + '">' + nextLabel + icon("arrow-right", 12) + '</button>' : '<span class="pipeline-closed-label">流程已结束</span>') +
      '<button class="icon-button soft tiny" data-action="open-application" data-application-id="' + escapeHTML(application.id) + '" aria-label="编辑投递">' + icon("settings-2", 14) + '</button>' +
      '</div></article>'
    );
  }

  function evidenceTypeClass(type) {
    if (type === "项目") return "green";
    if (type === "课程项目") return "blue";
    if (type === "实习") return "orange";
    return "violet";
  }

  function renderEvidenceCard(item) {
    const confidence = Math.max(0, Math.min(100, Number(item.confidence || 0)));
    const metrics = Array.isArray(item.metrics) ? item.metrics : [];
    const skills = Array.isArray(item.skills) ? item.skills : [];
    return (
      '<article class="evidence-card">' +
      '<div class="evidence-card-head"><div class="evidence-title-row"><span class="evidence-type type-' + evidenceTypeClass(item.type) + '">' + escapeHTML(item.type || "经历") + '</span><div><h3>' + escapeHTML(item.title) + '</h3><p>' + escapeHTML(item.role || "角色未填") + '<span>·</span>' + escapeHTML(item.period || "时间未填") + '</p></div></div><button class="icon-button soft tiny" data-action="open-evidence" data-evidence-id="' + escapeHTML(item.id) + '" aria-label="编辑证据">' + icon("settings-2", 14) + '</button></div>' +
      '<div class="evidence-strength"><span>证据强度</span><div class="meter"><i style="width:' + confidence + '%"></i></div><b>' + confidence + '</b></div>' +
      '<div class="evidence-story">' +
      '<div><span>情境</span><p>' + escapeHTML(item.situation || "待补充背景") + '</p></div>' +
      '<div><span>行动</span><p>' + escapeHTML(item.action || "待补充你的关键动作") + '</p></div>' +
      '<div class="result-section"><span>结果</span><p>' + escapeHTML(item.result || "待补充可验证结果") + '</p></div>' +
      '</div>' +
      '<div class="evidence-tags">' + metrics.map((metric) => '<span class="metric-chip">' + escapeHTML(metric) + '</span>').join("") + skills.map((skill) => '<span class="skill-chip">' + escapeHTML(skill) + '</span>').join("") + '</div>' +
      '<div class="evidence-actions"><button class="mini-button" data-prompt="' + escapeHTML("基于证据「" + item.title + "」帮我做一版 STAR 面试回答") + '">用它练 STAR' + icon("arrow-right", 12) + '</button><button class="text-button" data-action="open-evidence" data-evidence-id="' + escapeHTML(item.id) + '">编辑证据</button></div>' +
      '</article>'
    );
  }

  function analyzeTargetJob(job) {
    if (!window.CareerOS || !window.CareerOS.jobFit) return { score: 0, coverage: 0, matched: [], missing: [], requiredCount: 0, nextActions: [] };
    return window.CareerOS.jobFit.analyze(job, state.evidence || [], state.resume || {});
  }

  function renderJobCard(job) {
    const analysis = analyzeTargetJob(job);
    const deadline = job.deadline ? formatCalendarDate(job.deadline) : "未设置";
    const overdue = job.status !== "archived" && isPastDate(job.deadline);
    return (
      '<article class="job-card">' +
      '<div class="job-card-head"><div><div class="job-company-line"><span class="tag tag-neutral">' + escapeHTML(job.priority || "P1") + '</span><span>' + escapeHTML(job.company) + '</span></div><h3>' + escapeHTML(job.role) + '</h3><p>' + escapeHTML(job.city || "地点待定") + '<span>·</span>' + escapeHTML(job.source || "来源未填") + '</p></div><div class="job-score"><strong>' + analysis.score + '</strong><span>match</span></div></div>' +
      '<div class="job-coverage"><span>JD 证据覆盖</span><div class="meter"><i style="width:' + analysis.coverage + '%"></i></div><b>' + analysis.coverage + '%</b></div>' +
      '<div class="job-keyword-groups"><div><span>已覆盖</span>' + (analysis.matched.length ? analysis.matched.map((item) => '<b class="matched-chip">' + escapeHTML(item) + '</b>').join("") : '<b class="empty-chip">暂无</b>') + '</div><div><span>待补证据</span>' + (analysis.missing.length ? analysis.missing.map((item) => '<b class="missing-chip">' + escapeHTML(item) + '</b>').join("") : '<b class="matched-chip">核心能力已覆盖</b>') + '</div></div>' +
      (analysis.nextActions.length ? '<p class="job-next-action">' + icon("target", 14) + '<span>' + escapeHTML(analysis.nextActions[0]) + '</span></p>' : "") +
      '<div class="job-card-footer"><span class="job-deadline' + (overdue ? " is-overdue" : "") + '">' + icon("calendar-days", 13) + '截止 ' + deadline + '</span><div><button class="mini-button" data-prompt="' + escapeHTML("分析 " + job.company + " 的 " + job.role + " JD，并告诉我最缺什么证据") + '">问 Agent</button><button class="icon-button soft tiny" data-action="open-job" data-job-id="' + escapeHTML(job.id) + '" aria-label="编辑岗位">' + icon("settings-2", 14) + '</button><button class="mini-button" data-action="job-to-pipeline" data-job-id="' + escapeHTML(job.id) + '">转入投递' + icon("arrow-right", 12) + '</button></div></div>' +
      '</article>'
    );
  }

  function renderJobs() {
    const jobs = Array.isArray(state.jobTargets) ? state.jobTargets : [];
    const activeJobs = jobs.filter((item) => item.status !== "archived");
    const analyzed = activeJobs.map((job) => ({ job, analysis: analyzeTargetJob(job) }));
    const average = analyzed.length ? Math.round(analyzed.reduce((sum, item) => sum + item.analysis.score, 0) / analyzed.length) : 0;
    const priorityJobs = activeJobs.filter((item) => item.priority === "P0");
    const urgent = activeJobs.filter((item) => {
      if (!item.deadline) return false;
      const days = (new Date(item.deadline + "T23:59:59").getTime() - Date.now()) / 86400000;
      return days >= 0 && days <= 7;
    });
    const sorted = activeJobs.slice().sort((a, b) => {
      const priority = { P0: 0, P1: 1, P2: 2 };
      if (priority[a.priority] !== priority[b.priority]) return priority[a.priority] - priority[b.priority];
      return new Date(a.deadline || "2999-01-01").getTime() - new Date(b.deadline || "2999-01-01").getTime();
    });
    const html = [];
    html.push('<div class="view view-jobs">');
    html.push(pageHeading(
      "岗位研究",
      "用 JD 验证方向，而不是凭岗位名称猜测。",
      "把真实岗位要求和证据库放在一起看：哪些能力已有证据，哪些只是自我感觉，哪些需要先补再投。",
      '<button class="button button-secondary" data-prompt="分析我的目标岗位 JD 和证据覆盖情况">' + icon("sparkles", 16) + '让 Agent 分析</button><button class="button button-primary" data-action="open-job">' + icon("plus", 16) + '新增岗位</button>'
    ));
    html.push(
      '<div class="jobs-summary">' +
      '<div class="jobs-stat"><span>有效目标</span><strong>' + activeJobs.length + '</strong><small>已归档 ' + (jobs.length - activeJobs.length) + '</small></div>' +
      '<div class="jobs-stat"><span>P0 岗位</span><strong>' + priorityJobs.length + '</strong><small>优先验证</small></div>' +
      '<div class="jobs-stat"><span>平均匹配</span><strong>' + average + '</strong><small>JD × 证据覆盖</small></div>' +
      '<div class="jobs-stat highlight"><span>7 天内截止</span><strong>' + urgent.length + '</strong><small>需要优先处理</small></div>' +
      '</div>'
    );
    if (sorted.length) {
      html.push('<div class="jobs-grid">' + sorted.map(renderJobCard).join("") + '</div>');
    } else {
      html.push('<div class="card empty-state jobs-empty"><span>' + icon("search", 28) + '</span><p>还没有岗位研究记录</p><button class="button button-primary" data-action="open-job">添加第一个目标岗位</button></div>');
    }
    html.push(
      '<section class="job-principles card"><div class="job-principles-mark">' + icon("scan-search", 22) + '</div><div><span class="section-kicker">研究原则</span><h3>至少看完 3 份同类 JD，再判断一个方向。</h3><p>招聘标题不能代表真实工作。对齐职责、指标、协作对象和考核方式，才能判断这个岗位是否值得投入简历和面试时间。</p></div><div class="job-principles-stats"><span><b>01</b>职责场景</span><span><b>02</b>核心指标</span><span><b>03</b>能力证据</span></div></section>'
    );
    html.push('</div>');
    return html.join("");
  }

  function renderEvidence() {
    const items = Array.isArray(state.evidence) ? state.evidence : [];
    const strong = items.filter((item) => Number(item.confidence || 0) >= 75);
    const weak = items.filter((item) => Number(item.confidence || 0) < 70);
    const metricCount = items.reduce((sum, item) => sum + (Array.isArray(item.metrics) ? item.metrics.length : 0), 0);
    const uniqueSkills = Array.from(new Set(items.flatMap((item) => Array.isArray(item.skills) ? item.skills : [])));
    const average = items.length ? Math.round(items.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / items.length) : 0;
    const missingMetrics = items.filter((item) => !Array.isArray(item.metrics) || !item.metrics.length);
    const missingResult = items.filter((item) => !String(item.result || "").trim());
    const html = [];
    html.push('<div class="view view-evidence">');
    html.push(pageHeading(
      "证据库",
      "所有建议，都要能追到一条真实事实。",
      "定位、简历和面试共用同一套证据。Agent 可以重组表达，但不能替你编造项目、数字或结果。",
      '<button class="button button-secondary" data-prompt="审计我的证据库，告诉我最缺什么">' + icon("sparkles", 16) + '让 Agent 审计</button><button class="button button-primary" data-action="open-evidence">' + icon("plus", 16) + '新增证据</button>'
    ));
    html.push(
      '<div class="evidence-summary">' +
      '<div class="evidence-stat"><span>证据条目</span><strong>' + items.length + '</strong><small>来源可追溯</small></div>' +
      '<div class="evidence-stat"><span>强证据</span><strong>' + strong.length + '</strong><small>置信度 ≥ 75</small></div>' +
      '<div class="evidence-stat"><span>量化指标</span><strong>' + metricCount + '</strong><small>数字与变化</small></div>' +
      '<div class="evidence-stat"><span>能力标签</span><strong>' + uniqueSkills.length + '</strong><small>可迁移素材</small></div>' +
      '<div class="evidence-stat highlight"><span>平均强度</span><strong>' + average + '</strong><small>持续补证</small></div>' +
      '</div>'
    );
    html.push('<div class="evidence-layout">');
    html.push(
      '<section class="evidence-list-card card"><div class="card-heading"><div><span class="section-kicker">Evidence Vault</span><h3>你的真实素材</h3></div><span class="tag tag-neutral">' + items.length + ' 条</span></div><div class="evidence-list">' +
      (items.length ? items.map(renderEvidenceCard).join("") : '<div class="empty-state"><span>' + icon("bookmark", 28) + '</span><p>还没有证据条目</p><button class="button button-primary" data-action="open-evidence">添加第一条经历</button></div>') +
      '</div></section>'
    );
    html.push(
      '<aside class="evidence-sidebar">' +
      '<section class="card evidence-audit-card"><div class="card-heading"><div><span class="section-kicker">审计结果</span><h3>证据结构是否够用</h3></div></div><div class="audit-score"><strong>' + average + '</strong><span>/ 100</span></div><div class="meter-list compact"><div class="meter-row"><span>事实完整</span><div class="meter"><i style="width:' + Math.min(94, 35 + items.length * 10) + '%"></i></div><b>' + Math.min(94, 35 + items.length * 10) + '</b></div><div class="meter-row"><span>结果量化</span><div class="meter"><i class="orange" style="width:' + Math.min(94, 28 + metricCount * 7) + '%"></i></div><b>' + Math.min(94, 28 + metricCount * 7) + '</b></div><div class="meter-row"><span>岗位相关</span><div class="meter"><i class="blue" style="width:' + Math.min(94, 32 + uniqueSkills.length * 5) + '%"></i></div><b>' + Math.min(94, 32 + uniqueSkills.length * 5) + '</b></div></div></section>' +
      '<section class="card evidence-gaps-card"><div class="card-heading"><div><span class="section-kicker">优先补证</span><h3>下一步问什么</h3></div><span class="tag tag-orange">' + (missingMetrics.length + missingResult.length || 0) + '</span></div><ol class="evidence-questions"><li><span>01</span><p><strong>业务结果</strong>核心项目的转化率、留存或效率变化是多少？</p></li><li><span>02</span><p><strong>决策过程</strong>你是否比较过方案，为什么选最终版本？</p></li><li><span>03</span><p><strong>个人贡献</strong>去掉团队其他人后，哪些结果由你直接推动？</p></li></ol><button class="button button-secondary button-wide" data-action="evidence-to-plan">' + icon("calendar-check", 15) + '把补证任务写进计划</button></section>' +
      '<section class="card evidence-rule-card">' + icon("shield-check", 20) + '<div><strong>Fact-Lock 规则</strong><p>简历改写和面试回答只能使用证据库中出现过的事实。没有数据就保留空白，不把猜测写成结果。</p></div></section>' +
      '</aside>'
    );
    html.push('</div></div>');
    return html.join("");
  }

  function renderPipeline() {
    const apps = Array.isArray(state.applications) ? state.applications : [];
    const active = apps.filter((item) => item.stage !== "closed");
    const advanced = apps.filter((item) => ["assessment", "interview", "offer"].includes(item.stage));
    const offers = apps.filter((item) => item.stage === "offer");
    const feedbackCount = apps.filter((item) => String(item.feedback || "").trim()).length;
    const responseRate = apps.length ? Math.round((advanced.length / apps.length) * 100) : 0;
    const actionable = active
      .slice()
      .sort((a, b) => {
        const ad = a.nextAt ? new Date(a.nextAt).getTime() : Number.MAX_SAFE_INTEGER;
        const bd = b.nextAt ? new Date(b.nextAt).getTime() : Number.MAX_SAFE_INTEGER;
        return ad - bd;
      })
      .find((item) => item.nextAction);
    const html = [];
    html.push('<div class="view view-pipeline">');
    html.push(pageHeading(
      "投递与反馈闭环",
      "不要只记录投递，记录市场在说什么。",
      "每个阶段都需要留下下一步和反馈。Agent 会用这些信号判断是继续扩量、收紧方向，还是先修材料和面试表达。",
      '<button class="button button-secondary" data-prompt="分析我的投递流程和反馈并给下一步建议">' + icon("sparkles", 16) + '让 Agent 复盘</button><button class="button button-primary" data-action="open-application">' + icon("plus", 16) + '新增投递</button>'
    ));
    html.push(
      '<div class="pipeline-summary">' +
      '<div class="pipeline-stat"><span>活跃流程</span><strong>' + active.length + '</strong><small>共记录 ' + apps.length + ' 条</small></div>' +
      '<div class="pipeline-stat"><span>进入测评 / 面试</span><strong>' + advanced.length + '</strong><small>响应率 ' + responseRate + '%</small></div>' +
      '<div class="pipeline-stat"><span>面试中</span><strong>' + apps.filter((item) => item.stage === "interview").length + '</strong><small>当前最需要准备</small></div>' +
      '<div class="pipeline-stat highlight"><span>Offer</span><strong>' + offers.length + '</strong><small>不把单次结果当结论</small></div>' +
      '<div class="pipeline-stat"><span>反馈样本</span><strong>' + feedbackCount + '</strong><small>至少 3 条再调策略</small></div>' +
      '</div>'
    );
    html.push('<div class="pipeline-board-wrap"><div class="pipeline-board">');
    PIPELINE_STAGES.forEach((stage) => {
      const cards = apps.filter((item) => item.stage === stage.id);
      html.push(
        '<section class="pipeline-column">' +
        '<div class="pipeline-column-head"><div><span class="stage-dot stage-' + stage.color + '"></span><strong>' + stage.label + '</strong></div><span>' + cards.length + '</span></div>' +
        '<div class="pipeline-column-body">' +
        (cards.length ? cards.map(renderApplicationCard).join("") : '<div class="pipeline-empty">' + icon("plus", 17) + '<span>暂无记录</span></div>') +
        '</div></section>'
      );
    });
    html.push('</div></div>');
    html.push(
      '<div class="pipeline-bottom-grid">' +
      '<section class="card pipeline-focus-card"><span class="section-kicker">当前最该做的事</span><h3>' + escapeHTML(actionable ? actionable.nextAction : "补充新的投递记录") + '</h3><p>' + escapeHTML(actionable ? actionable.company + " · " + actionable.role + "，计划时间 " + formatCalendarDate(actionable.nextAt) : "没有待办时，不要用焦虑驱动海投；先补 3 条样本或复盘已结束流程。") + '</p>' +
      (actionable ? '<button class="button button-primary" data-action="open-application" data-application-id="' + actionable.id + '">更新这条记录</button>' : '<button class="button button-primary" data-action="open-application">新增投递</button>') + '</section>' +
      '<section class="card feedback-card"><div class="card-heading"><div><span class="section-kicker">反馈信号</span><h3>哪些反馈值得写下来</h3></div><span class="tag tag-orange">关键</span></div><div class="feedback-examples"><p><strong>简历反馈</strong>岗位不匹配、关键词不足、项目结果不清。</p><p><strong>面试反馈</strong>表达太长、个人贡献模糊、数据归因缺失。</p><p><strong>市场反馈</strong>同方向连续未过初筛，才考虑调整定位。</p></div></section>' +
      '</div>'
    );
    html.push('</div>');
    return html.join("");
  }

  function renderPositioning() {
    const readiness = getReadiness();
    const selected = state.roles.find((role) => role.selected);
    const evidence = Math.min(90, Math.round(34 + (state.resume.score || 0) * 0.48 + taskCompletion() * 0.18));
    const clarity = readiness.positioning;
    const market = Math.round(state.roles.reduce((sum, role) => sum + role.fit, 0) / state.roles.length);
    const html = [];
    html.push('<div class="view view-positioning">');
    html.push(pageHeading(
      "职业定位 2.0",
      "先选一条值得验证的路。",
      "定位不是给人生下结论，而是基于当前证据选出最值得投入的假设，再用低成本行动验证。",
      '<button class="button button-secondary" data-action="open-profile">' + icon("sliders-horizontal", 16) + '更新画像</button><button class="button button-primary" data-prompt="根据我的能力重新评估岗位方向">' + icon("sparkles", 16) + '让 Agent 重算</button>'
    ));
    html.push('<div class="positioning-grid">');
    html.push(
      '<section class="card profile-snapshot">' +
      '<div class="profile-snapshot-head"><div class="avatar avatar-lg">' + escapeHTML(String(state.profile.name).slice(0, 1)) + '</div><div><span class="section-kicker">候选人画像</span><h3>' + escapeHTML(state.profile.name) + '</h3><p>' + escapeHTML(state.profile.school) + ' · ' + escapeHTML(state.profile.major) + '</p></div><span class="completion-badge">' + readiness.completeness + '% 完整</span></div>' +
      '<dl class="profile-facts"><div><dt>求职周期</dt><dd>' + escapeHTML(state.profile.gradYear) + ' 届秋招</dd></div><div><dt>目标方向</dt><dd>' + escapeHTML(state.profile.targetTrack) + '</dd></div><div><dt>目标城市</dt><dd>' + escapeHTML(state.profile.cities) + '</dd></div><div><dt>可投入时间</dt><dd>' + state.profile.weeklyHours + ' 小时 / 周</dd></div></dl>' +
      '<div class="constraint-note">' + icon("triangle-alert", 16) + '<p><strong>现实约束</strong>' + escapeHTML(state.profile.constraints) + '</p></div>' +
      '</section>'
    );
    html.push(
      '<section class="card diagnostic-card">' +
      '<div class="card-heading"><div><span class="section-kicker">当前定位质量</span><h3>三个维度都还不够稳</h3></div><span class="status-label">需要验证</span></div>' +
      '<div class="meter-list">' +
      '<div class="meter-row"><span>方向清晰度</span><div class="meter"><i style="width:' + clarity + '%"></i></div><b>' + clarity + '%</b></div>' +
      '<div class="meter-row"><span>证据强度</span><div class="meter"><i class="orange" style="width:' + evidence + '%"></i></div><b>' + evidence + '%</b></div>' +
      '<div class="meter-row"><span>市场匹配</span><div class="meter"><i class="blue" style="width:' + market + '%"></i></div><b>' + market + '%</b></div>' +
      '</div>' +
      '<div class="diagnostic-note"><span class="note-number">下一步</span><p>用 3 个真实岗位样本验证「' + escapeHTML(selected.title) + '」的职责是否与你的优势一致，再决定是否扩大投递。</p></div>' +
      '</section>'
    );
    html.push(
      '<section class="card strengths-card">' +
      '<div class="card-heading"><div><span class="section-kicker">可迁移优势</span><h3>你已经有什么</h3></div><button class="text-button" data-view="evidence">管理证据库' + icon("arrow-right", 14) + '</button></div>' +
      '<div class="strength-list">' +
      '<div><span class="strength-icon">' + icon("message-square", 18) + '</span><div><strong>用户研究</strong><p>有访谈、竞品观察与需求归纳的实际经验，能快速把模糊反馈转成问题定义。</p></div></div>' +
      '<div><span class="strength-icon warm">' + icon("target", 18) + '</span><div><strong>项目推动</strong><p>从需求到上线完整参与过校园产品，理解跨角色协作的基本节奏。</p></div></div>' +
      '<div><span class="strength-icon blue">' + icon("trending-up", 18) + '</span><div><strong>数据意识</strong><p>具备 Python 与 SQL 基础，能把分析结果转成可读的结论，但业务指标训练不足。</p></div></div>' +
      '</div></section>'
    );
    html.push(
      '<section class="card gaps-card">' +
      '<div class="card-heading"><div><span class="section-kicker">主要缺口</span><h3>补什么最划算</h3></div></div>' +
      '<ol class="gap-list"><li><span>01</span><div><strong>业务结果证据</strong><p>不只写活跃人数，还要说明留存、转化、复购或成本变化。</p></div></li><li><span>02</span><div><strong>指标与实验语言</strong><p>能解释为什么看这个指标、如何做对照、结果怎么判断。</p></div></li><li><span>03</span><div><strong>岗位场景理解</strong><p>区分内容运营、活动运营、用户运营与数据产品的日常差异。</p></div></li></ol>' +
      '<button class="button button-secondary button-wide" data-action="positioning-to-plan">把缺口写进本周计划</button>' +
      '</section>'
    );
    html.push('</div>');
    html.push(
      '<section class="role-market-section"><div class="section-heading-row"><div><span class="section-kicker">方向组合</span><h2>四个可行方向，一条主攻线</h2><p>匹配度由专业、经历、能力证据、地点与岗位供给共同估算，仅作为验证起点。</p></div><span class="market-updated">市场样本更新于 10 月 28 日</span></div>' +
      '<div class="role-card-grid">' +
      state.roles.map((role) => (
        '<article class="role-card' + (role.selected ? " is-selected" : "") + '">' +
        '<div class="role-card-top"><span class="tag ' + (role.selected ? "tag-green" : "tag-neutral") + '">' + escapeHTML(role.status) + '</span><div class="role-fit-ring" style="--fit:' + role.fit + '"><strong>' + role.fit + '</strong><span>%</span></div></div>' +
        '<h3>' + escapeHTML(role.title) + '</h3><p class="role-track">' + escapeHTML(role.track) + ' · ' + escapeHTML(role.salary) + '</p><p class="role-why">' + escapeHTML(role.why) + '</p>' +
        '<div class="role-gaps">' + role.gaps.map((gap) => '<span>' + escapeHTML(gap) + '</span>').join("") + '</div>' +
        '<button class="button ' + (role.selected ? "button-soft" : "button-secondary") + ' button-wide" data-role-lock="' + role.id + '">' + (role.selected ? icon("check", 15) + "当前主攻方向" : "锁定为验证方向") + '</button>' +
        '</article>'
      )).join("") +
      '</div></section>'
    );
    html.push('</div>');
    return html.join("");
  }

  function renderResume() {
    const resume = state.resume;
    const lastReview = formatDate(resume.lastReviewed);
    const html = [];
    html.push('<div class="view view-resume">');
    html.push(pageHeading(
      "简历工坊",
      "让每一行都对岗位有用。",
      "结构化检查不是替你编经历，而是把真实做过的事翻译成招聘方能快速判断的证据。",
      '<button class="button button-secondary" data-action="upload-resume">' + icon("upload", 16) + '上传文本简历</button><button class="button button-primary" type="submit" form="resume-form">' + icon("scan-search", 16) + '重新诊断</button>'
    ));
    html.push('<div class="resume-layout">');
    html.push(
      '<section class="card resume-editor-card">' +
      '<div class="card-heading"><div><span class="section-kicker">简历正文</span><h3>编辑与目标岗位</h3></div><span class="file-pill">' + icon("file-text", 14) + escapeHTML(resume.fileName || "未命名") + '</span></div>' +
      '<form id="resume-form" class="resume-form">' +
      '<div class="editor-tabs"><button type="button" class="editor-tab is-active">简历正文</button><button type="button" class="editor-tab" data-action="show-jd-help">目标 JD</button><span class="editor-count"><b id="resume-char-count">' + resume.text.length + '</b> 字</span></div>' +
      '<textarea id="resume-text" name="resumeText" class="code-textarea" spellcheck="false" aria-label="简历正文">' + escapeHTML(resume.text) + '</textarea>' +
      '<div class="field-group"><label for="target-jd">目标岗位描述 <span>用于关键词与职责匹配</span></label><textarea id="target-jd" name="targetJD" class="jd-textarea" aria-label="目标岗位描述">' + escapeHTML(resume.targetJD) + '</textarea></div>' +
      '<div class="form-footer"><span class="helper-text">当前为本地演示诊断，不会上传你的文件。</span><button class="button button-primary" type="submit">' + icon("scan-search", 16) + '运行诊断</button></div>' +
      '</form>' +
      '<input type="file" id="resume-file" accept=".txt,.md,text/plain,text/markdown" hidden />' +
      '</section>'
    );
    html.push(
      '<aside class="resume-diagnostic-column">' +
      '<section class="card score-card">' +
      '<div class="score-card-head"><div><span class="section-kicker">综合诊断</span><h3>简历匹配分</h3></div><span class="review-time">' + escapeHTML(lastReview) + '</span></div>' +
      '<div class="big-score"><strong>' + resume.score + '</strong><span>/ 100</span></div>' +
      '<div class="score-verdict">' + (resume.score >= 75 ? "可以进入投递测试" : resume.score >= 60 ? "方向正确，证据不足" : "需要一次结构性改写") + '</div>' +
      '<div class="meter-list compact">' + resume.dimensions.map((dimension) => '<div class="meter-row"><span>' + escapeHTML(dimension.label) + '</span><div class="meter"><i style="width:' + dimension.value + '%"></i></div><b>' + dimension.value + '</b></div>').join("") + '</div>' +
      '</section>' +
      '<section class="card issue-card"><div class="card-heading"><div><span class="section-kicker">优先修改</span><h3>先动这三处</h3></div><span class="tag tag-orange">' + resume.issues.length + ' 项</span></div><ol class="issue-list">' + resume.issues.map((issue, index) => '<li><span>' + String(index + 1).padStart(2, "0") + '</span><p>' + escapeHTML(issue) + '</p></li>').join("") + '</ol><button class="button button-secondary button-wide" data-action="resume-to-plan">' + icon("calendar-check", 15) + '生成修改任务</button></section>' +
      '</aside>'
    );
    html.push('</div>');
    html.push(
      '<section class="rewrite-strip"><div class="rewrite-before"><span class="section-kicker">修改前</span><p>负责需求调研、功能规划和活动运营，组织 4 人团队完成小程序一期上线。</p></div>' + icon("arrow-right", 20) + '<div class="rewrite-after"><span class="section-kicker">修改方向</span><p>访谈 18 位目标用户，归纳出 3 个高频阻碍并砍掉 2 个低优先级功能；上线 6 周获得 1,200 名注册用户，次周留存 <mark>待补</mark>。</p></div><button class="icon-button" data-prompt="请按这个方向帮我重写一段简历项目经历">' + icon("wand-sparkles", 18) + '</button></section>'
    );
    html.push('</div>');
    return html.join("");
  }

  const INTERVIEW_QUESTIONS = {
    behavior: [
      { title: "自我介绍", prompt: "请用 90 秒介绍自己，并说明为什么选择产品运营。" },
      { title: "项目主导", prompt: "讲一个你真正推动过的项目。你做了什么关键决策，结果如何？" },
      { title: "冲突处理", prompt: "团队成员对你的方案有强烈异议时，你通常怎么处理？请举一个真实例子。" },
      { title: "失败复盘", prompt: "说一次没有达到预期的经历。你当时忽略了什么，后来怎么修正？" },
      { title: "岗位理解", prompt: "你认为产品运营在入职前三个月最重要的产出是什么？为什么？" },
    ],
    cases: [
      { title: "指标诊断", prompt: "某校园产品注册量一周下降 30%，你会如何定位原因并安排验证？" },
      { title: "活动设计", prompt: "为准备秋招的学生设计一个 7 天拉新活动，说明目标、机制和衡量指标。" },
      { title: "需求排序", prompt: "你手上同时有增长、体验和商业化三个需求，但研发只够做一个。你如何排序？" },
      { title: "复盘设计", prompt: "一次活动带来了大量新用户，但 7 日留存很低。你会怎样复盘？" },
    ],
    stress: [
      { title: "证据追问", prompt: "你的自我介绍听起来很模板。除了课程背景，你有什么证据证明自己适合产品运营？" },
      { title: "贡献边界", prompt: "你说自己负责项目，但团队有 4 个人。去掉团队其他成员后，哪些成果真正由你产生？" },
      { title: "结果质疑", prompt: "1,200 个注册用户可能只是活动送奖品带来的。你如何证明产品本身有价值？" },
      { title: "压力选择", prompt: "如果明天有一场重要面试，但你的简历仍然很差，你今天只改哪一处？给出理由。" },
      { title: "反向提问", prompt: "我暂时不认为你比一个已有大厂实习的候选人更合适。你准备怎么反驳？" },
    ],
  };

  function getInterviewQuestions() {
    return INTERVIEW_QUESTIONS[state.interview.mode] || INTERVIEW_QUESTIONS.behavior;
  }

  function renderInterview() {
    const interview = state.interview;
    const questions = getInterviewQuestions();
    const current = questions[Math.min(interview.index, questions.length - 1)];
    const modeLabels = { behavior: "行为面试", cases: "业务案例", stress: "压力测试" };
    const intensities = { gentle: "温和", standard: "标准", high: "高压" };
    const average = interview.history.length
      ? Math.round(interview.history.reduce((sum, item) => sum + item.score, 0) / interview.history.length)
      : 0;

    const html = [];
    html.push('<div class="view view-interview">');
    html.push(pageHeading(
      "模拟面试",
      "在真正的面试前，先把问题暴露出来。",
      "Agent 会根据目标岗位追问证据、压缩空泛表达，并把每次回答转成下一次训练重点。",
      '<button class="button button-secondary" data-action="restart-interview">' + icon("rotate-ccw", 16) + '重新开始</button><button class="button button-primary" data-prompt="给我安排一次高压模拟面试">' + icon("flame", 16) + '让 Agent 出题</button>'
    ));
    html.push('<div class="interview-layout">');
    html.push(
      '<section class="card interview-stage">' +
      '<div class="interview-stage-head">' +
      '<div class="interview-mode-badge ' + (interview.mode === "stress" ? "is-stress" : "") + '">' + icon(interview.mode === "stress" ? "flame" : "mic", 16) + '<span>' + modeLabels[interview.mode] + ' · ' + intensities[interview.intensity] + '</span></div>' +
      '<div class="interview-progress"><span>练习进度</span><div class="mini-progress"><i style="width:' + Math.round(((interview.index + (interview.done ? 1 : 0)) / questions.length) * 100) + '%"></i></div><b>' + Math.min(interview.index + (interview.done ? 0 : 1), questions.length) + ' / ' + questions.length + '</b></div>' +
      '</div>'
    );

    if (!interview.started) {
      html.push(
        '<div class="interview-start">' +
        '<div class="interview-start-visual"><span>' + icon("message-square", 42) + '</span><i></i><i></i><i></i></div>' +
        '<span class="section-kicker">准备开始</span><h2>不背标准答案，只练真实表达。</h2><p>每轮只问一个问题。建议用手机录音，回答后看反馈，再决定是否重答。</p>' +
        '<div class="start-rules"><div><span>01</span><p>先讲背景，再讲你做了什么决策</p></div><div><span>02</span><p>结果尽量用数字或可验证变化</p></div><div><span>03</span><p>压力模式下会连续追问，不留缓冲</p></div></div>' +
        '<button class="button button-primary button-large" data-action="start-interview">' + icon("play", 17) + '开始模拟面试</button>' +
        '</div>'
      );
    } else if (interview.done) {
      const best = interview.history.slice().sort((a, b) => b.score - a.score)[0];
      const weakest = interview.history.slice().sort((a, b) => a.score - b.score)[0];
      html.push(
        '<div class="interview-report">' +
        '<div class="report-score"><span>本轮表现</span><strong>' + average + '</strong><small>/ 100</small></div>' +
        '<div class="report-copy"><span class="section-kicker">训练报告</span><h2>' + (average >= 75 ? "表达基础已经可用，继续补强证据密度。" : average >= 55 ? "结构基本完整，但关键追问仍然吃力。" : "先从回答长度和结果证据开始修正。") + '</h2><p>你最好的回答是「' + escapeHTML(best.title) + '」，最需要重练的是「' + escapeHTML(weakest.title) + '」。</p></div>' +
        '<div class="report-grid">' +
        '<div><strong>' + interview.history.length + '</strong><span>完成题目</span></div><div><strong>' + Math.round(interview.history.filter((item) => item.score >= 70).length / Math.max(1, interview.history.length) * 100) + '%</strong><span>达标率</span></div><div><strong>' + (interview.mode === "stress" ? "高压" : "标准") + '</strong><span>训练强度</span></div>' +
        '</div>' +
        '<div class="report-actions"><button class="button button-primary" data-action="restart-interview">' + icon("rotate-ccw", 16) + '再练一轮</button><button class="button button-secondary" data-prompt="帮我复盘刚才的模拟面试表现">' + icon("sparkles", 16) + '让 Agent 复盘</button></div>' +
        '</div>'
      );
    } else {
      html.push(
        '<div class="interview-session">' +
        '<div class="question-card"><div class="question-meta"><span>问题 ' + String(interview.index + 1).padStart(2, "0") + '</span><span>' + escapeHTML(current.title) + '</span></div><h2>' + escapeHTML(current.prompt) + '</h2>' +
        (interview.mode === "stress" ? '<div class="stress-note">' + icon("flame", 16) + '<span>压力模式：面试官可能打断或质疑你的证据，请直接回应，不要绕开。</span></div>' : '') +
        '</div>' +
        '<form id="interview-form" class="answer-form"><label for="interview-answer">你的回答 <span>建议 60-90 秒</span></label><textarea id="interview-answer" name="answer" rows="7" placeholder="先给结论，再补充背景、行动和结果..."></textarea><div class="form-footer"><span class="helper-text">本轮反馈基于本地启发式规则，用于演示 Agent 反馈闭环。</span><button class="button button-primary" type="submit">' + icon("arrow-up", 16) + '提交回答</button></div></form>' +
        (interview.history.length ? '<div class="answer-history"><div class="section-heading-row small"><h3>刚才的回答</h3><span>即时反馈</span></div>' + interview.history.slice(-2).map((item) => '<details class="answer-feedback" ' + (item === interview.history[interview.history.length - 1] ? "open" : "") + '><summary><span>' + escapeHTML(item.title) + '</span><b>' + item.score + '</b>' + icon("chevron-down", 15) + '</summary><div><p class="answer-text">' + escapeHTML(item.answer) + '</p><ul>' + item.feedback.map((point) => '<li>' + escapeHTML(point) + '</li>').join("") + '</ul></div></details>').join("") + '</div>' : "") +
        '</div>'
      );
    }
    html.push('</section>');

    html.push(
      '<aside class="interview-controls">' +
      '<section class="card mode-card"><div class="card-heading"><div><span class="section-kicker">训练模式</span><h3>选择面试验</h3></div></div>' +
      '<div class="mode-list">' +
      '<button class="mode-option ' + (interview.mode === "behavior" ? "is-active" : "") + '" data-mode="behavior"><span class="mode-icon">' + icon("message-square", 18) + '</span><span><strong>行为面试</strong><small>经历、动机、协作</small></span>' + (interview.mode === "behavior" ? icon("check", 15) : "") + '</button>' +
      '<button class="mode-option ' + (interview.mode === "cases" ? "is-active" : "") + '" data-mode="cases"><span class="mode-icon">' + icon("briefcase", 18) + '</span><span><strong>业务案例</strong><small>指标、方案、复盘</small></span>' + (interview.mode === "cases" ? icon("check", 15) : "") + '</button>' +
      '<button class="mode-option ' + (interview.mode === "stress" ? "is-active" : "") + '" data-mode="stress"><span class="mode-icon red">' + icon("flame", 18) + '</span><span><strong>压力测试</strong><small>追问、质疑、打断</small></span>' + (interview.mode === "stress" ? icon("check", 15) : "") + '</button>' +
      '</div></section>' +
      '<section class="card intensity-card"><div class="card-heading"><div><span class="section-kicker">强度</span><h3>按准备程度调整</h3></div></div><div class="segmented three">' +
      '<button class="' + (interview.intensity === "gentle" ? "is-active" : "") + '" data-intensity="gentle">温和</button><button class="' + (interview.intensity === "standard" ? "is-active" : "") + '" data-intensity="standard">标准</button><button class="' + (interview.intensity === "high" ? "is-active" : "") + '" data-intensity="high">高压</button>' +
      '</div><button class="button button-secondary button-wide" data-action="start-interview">' + icon("play", 15) + (interview.started ? "重新开始当前模式" : "开始本轮训练") + '</button></section>' +
      '<section class="card rubric-card"><div class="card-heading"><div><span class="section-kicker">评分维度</span><h3>Agent 看什么</h3></div><span class="tag tag-neutral">4 项</span></div><ul class="rubric-list"><li><span>01</span><p><strong>结构</strong>先结论，后证据，别按时间流水账。</p></li><li><span>02</span><p><strong>贡献</strong>明确你的判断与动作，不用“我们”掩盖。</p></li><li><span>03</span><p><strong>结果</strong>至少一个数字、对比或可验证变化。</p></li><li><span>04</span><p><strong>反思</strong>能说明代价、权衡和下次修正。</p></li></ul></section>' +
      '</aside>'
    );
    html.push('</div></div>');
    return html.join("");
  }

  function renderPlan() {
    const filters = [
      { id: "all", label: "全部" },
      { id: "resume", label: "简历" },
      { id: "research", label: "岗位研究" },
      { id: "interview", label: "面试" },
      { id: "application", label: "投递" },
      { id: "review", label: "复盘" },
    ];
    const tasks = state.tasks.filter((task) => ui.planFilter === "all" || task.category === ui.planFilter);
    const totalMinutes = state.tasks.reduce((sum, task) => sum + Number(task.duration || 0), 0);
    const doneMinutes = state.tasks.filter((task) => task.done).reduce((sum, task) => sum + Number(task.duration || 0), 0);
    const completed = state.tasks.filter((task) => task.done).length;
    const html = [];
    html.push('<div class="view view-plan">');
    html.push(pageHeading(
      "行动计划 · 第 06 周",
      "计划要足够小，才能真的发生。",
      "Agent 已按 " + state.profile.weeklyHours + " 小时/周压缩主线。当前版本优先补证据，不追求把日历填满。",
      '<button class="button button-secondary" data-action="download-plan">' + icon("download", 16) + '导出计划</button><button class="button button-primary" data-action="generate-plan">' + icon("sparkles", 16) + '让 Agent 重排</button>'
    ));
    html.push('<div class="plan-summary">');
    html.push('<div class="summary-stat"><span>本周关键动作</span><strong>' + state.tasks.length + '</strong><small>已完成 ' + completed + '</small></div>');
    html.push('<div class="summary-stat"><span>计划投入</span><strong>' + totalMinutes + '<i> min</i></strong><small>约 ' + (totalMinutes / 60).toFixed(1) + ' 小时</small></div>');
    html.push('<div class="summary-stat"><span>已完成投入</span><strong>' + doneMinutes + '<i> min</i></strong><small>完成率 ' + taskCompletion() + '%</small></div>');
    html.push('<div class="summary-stat highlight"><span>本周策略</span><strong>先验证</strong><small>不急着海投</small></div>');
    html.push('<button class="summary-add" data-action="open-task">' + icon("plus", 18) + '<span>添加任务</span></button>');
    html.push('</div>');
    html.push('<div class="plan-layout">');
    html.push(
      '<section class="card plan-list-card">' +
      '<div class="card-heading"><div><span class="section-kicker">任务清单</span><h3>按优先级执行</h3></div><div class="filter-tabs">' + filters.map((filter) => '<button class="' + (ui.planFilter === filter.id ? "is-active" : "") + '" data-plan-filter="' + filter.id + '">' + filter.label + '</button>').join("") + '</div></div>' +
      '<div class="progress-strip"><span style="width:' + taskCompletion() + '%"></span><div><strong>' + completed + '</strong> / ' + state.tasks.length + ' 已完成</div></div>' +
      '<div class="plan-task-list">' + (tasks.length ? tasks.map((task) => renderTaskRow(task, false)).join("") : '<div class="empty-state"><span>' + icon("calendar-check", 28) + '</span><p>这个筛选下暂时没有任务</p></div>') + '</div>' +
      '</section>'
    );
    html.push(
      '<aside class="plan-side">' +
      '<section class="card focus-card"><div class="focus-card-icon">' + icon("flame", 20) + '</div><span class="section-kicker">今日重点</span><h3>' + escapeHTML((nextTask() && nextTask().title) || "今日任务已完成") + '</h3><p>' + escapeHTML((nextTask() && nextTask().detail) || "回顾一下今天新得到的信息，再决定明天是否调整。") + '</p><button class="button button-dark button-wide" data-action="focus-next-task">' + icon("play", 14) + '进入专注</button></section>' +
      '<section class="card load-card"><div class="card-heading"><div><span class="section-kicker">负荷检查</span><h3>时间分配</h3></div><span class="tag tag-green">可承受</span></div><div class="load-bar"><i style="width:' + Math.min(100, Math.round(totalMinutes / (state.profile.weeklyHours * 60) * 100)) + '%"></i></div><div class="load-labels"><span>计划 ' + Math.round(totalMinutes / 60 * 10) / 10 + 'h</span><span>可用 ' + state.profile.weeklyHours + 'h</span></div><p class="muted-copy">留出约 30% 缓冲，处理课程、毕设和临时面试。</p></section>' +
      '<section class="card rule-card"><span class="section-kicker">执行规则</span><ul class="rule-list"><li><span>01</span><p>连续两天未完成，就缩短任务，不加提醒。</p></li><li><span>02</span><p>每投 3 个岗位，必须复盘一次反馈。</p></li><li><span>03</span><p>收到面试后，暂停扩量，优先补岗位案例。</p></li></ul></section>' +
      '</aside>'
    );
    html.push('</div></div>');
    return html.join("");
  }

  function renderProfile() {
    const readiness = getReadiness();
    const html = [];
    html.push('<div class="view view-profile">');
    html.push(pageHeading(
      "个人档案",
      "Agent 对你的理解，应该可检查、可修改。",
      "画像、简历、面试记录与偏好共同构成个性化方案的基础。当前数据仅保存在本机浏览器。",
      '<button class="button button-secondary" data-action="download-report">' + icon("download", 15) + '导出档案</button><button class="button button-secondary" data-action="reset-data">' + icon("trash-2", 15) + '重置数据</button><button class="button button-primary" type="submit" form="profile-page-form">' + icon("check", 16) + '保存档案</button>'
    ));
    html.push('<div class="profile-layout">');
    html.push(
      '<section class="card profile-summary-card">' +
      '<div class="profile-completion-ring" style="--completion:' + readiness.completeness + '"><div><strong>' + readiness.completeness + '%</strong><span>画像完整度</span></div></div>' +
      '<h3>' + escapeHTML(state.profile.name) + '</h3><p>' + escapeHTML(state.profile.school) + ' · ' + escapeHTML(state.profile.major) + '</p>' +
      '<div class="profile-tags"><span>' + escapeHTML(state.profile.targetTrack) + '</span><span>' + escapeHTML(state.profile.gradYear) + ' 届</span><span>' + escapeHTML(state.profile.cities) + '</span></div>' +
      '<div class="profile-mini-stat"><div><strong>' + state.memory.length + '</strong><span>条长期记忆</span></div><div><strong>' + state.interview.history.length + '</strong><span>次面试回答</span></div></div>' +
      '<button class="button button-secondary button-wide" data-action="open-profile">' + icon("sliders-horizontal", 15) + '快速编辑画像</button>' +
      '</section>'
    );
    html.push(
      '<section class="card profile-form-card">' +
      '<div class="card-heading"><div><span class="section-kicker">基础信息</span><h3>让 Agent 知道你的现实条件</h3></div><span class="tag tag-neutral">本地存储</span></div>' +
      '<form id="profile-page-form">' + profileFormFields(state.profile) + '<div class="form-footer"><span class="helper-text">修改目标方向后，现有计划不会自动删除，你可以让 Agent 重新排期。</span><button class="button button-primary" type="submit">保存档案</button></div></form>' +
      '</section>'
    );
    html.push('</div>');
    html.push(
      '<div class="profile-bottom-grid">' +
      '<section class="card memory-card"><div class="card-heading"><div><span class="section-kicker">长期记忆</span><h3>Agent 记住的关键信息</h3></div><span class="tag tag-green">可编辑</span></div><div class="memory-list">' + state.memory.slice(-4).reverse().map((item) => '<div class="memory-item"><span class="memory-type">' + escapeHTML(item.type) + '</span><p>' + escapeHTML(item.content) + '</p><small>' + formatDate(item.createdAt) + '</small></div>').join("") + '</div></section>' +
      '<section class="card privacy-card"><div class="privacy-icon">' + icon("shield-check", 24) + '</div><div><span class="section-kicker">数据与边界</span><h3>你的职业数据属于你</h3><p>本演示不会把数据上传到服务器。接入真实模型后，应保留逐项授权、删除记忆、导出档案和敏感信息脱敏能力。</p><div class="privacy-points"><span>' + icon("lock", 14) + '最小权限访问</span><span>' + icon("fingerprint", 14) + '可追溯变更</span><span>' + icon("download", 14) + '一键导出</span></div></div></section>' +
      '</div>'
    );
    html.push('</div>');
    return html.join("");
  }

  function profileFormFields(profile) {
    return (
      '<div class="form-grid">' +
      '<label class="field"><span>姓名 / 称呼</span><input name="name" value="' + escapeHTML(profile.name) + '" required /></label>' +
      '<label class="field"><span>毕业年份</span><select name="gradYear"><option ' + (profile.gradYear === "2026" ? "selected" : "") + '>2026</option><option ' + (profile.gradYear === "2027" ? "selected" : "") + '>2027</option><option ' + (profile.gradYear === "2028" ? "selected" : "") + '>2028</option></select></label>' +
      '<label class="field"><span>学校</span><input name="school" value="' + escapeHTML(profile.school) + '" /></label>' +
      '<label class="field"><span>专业</span><input name="major" value="' + escapeHTML(profile.major) + '" /></label>' +
      '<label class="field"><span>目标方向</span><input name="targetTrack" value="' + escapeHTML(profile.targetTrack) + '" /></label>' +
      '<label class="field"><span>目标行业</span><input name="targetCompany" value="' + escapeHTML(profile.targetCompany) + '" /></label>' +
      '<label class="field"><span>目标城市</span><input name="cities" value="' + escapeHTML(profile.cities) + '" /></label>' +
      '<label class="field"><span>每周可投入小时</span><input name="weeklyHours" type="number" min="1" max="80" value="' + escapeHTML(profile.weeklyHours) + '" /></label>' +
      '<label class="field field-wide"><span>现有经历水平</span><input name="experienceLevel" value="' + escapeHTML(profile.experienceLevel) + '" /></label>' +
      '<label class="field field-wide"><span>最强能力</span><input name="strongest" value="' + escapeHTML(profile.strongest) + '" /></label>' +
      '<label class="field field-wide"><span>现实约束</span><textarea name="constraints" rows="3">' + escapeHTML(profile.constraints) + '</textarea></label>' +
      '</div>'
    );
  }

  function openModal(content, options) {
    const settings = options || {};
    $("#modal-root").innerHTML = '<div class="modal-backdrop" data-action="close-modal"><section class="modal ' + (settings.className || "") + '" role="dialog" aria-modal="true" aria-label="' + escapeHTML(settings.label || "对话框") + '" data-modal-panel><div class="modal-head"><div><span class="section-kicker">' + escapeHTML(settings.kicker || "职途 Career OS") + '</span><h2>' + escapeHTML(settings.title || "") + '</h2></div><button class="icon-button" data-action="close-modal" aria-label="关闭">' + icon("x") + '</button></div><div class="modal-body">' + content + '</div></section></div>';
    hydrateIcons($("#modal-root"));
    document.body.classList.add("has-overlay");
    requestAnimationFrame(() => {
      const focusTarget = $("#modal-root input, #modal-root textarea, #modal-root button");
      if (focusTarget) focusTarget.focus();
    });
  }

  function closeModal() {
    $("#modal-root").innerHTML = "";
    renderShell();
  }

  function openProfileModal() {
    const content =
      '<form id="profile-form" class="modal-form">' + profileFormFields(state.profile) +
      '<div class="modal-note">' + icon("brain-circuit", 16) + '<span>保存后，Agent 会在下一轮对话中使用新的背景与约束。</span></div>' +
      '<div class="modal-actions"><button type="button" class="button button-secondary" data-action="close-modal">取消</button><button type="submit" class="button button-primary">保存并校准方案</button></div></form>';
    openModal(content, { title: "更新个人画像", kicker: "Agent 上下文", label: "更新个人画像", className: "modal-wide" });
  }

  function onboardingDraftValues() {
    return Object.assign({}, state.profile, ui.onboardingDraft || {});
  }

  function onboardingStepContent(step, draft) {
    if (step === 0) {
      return (
        '<div class="onboarding-step-copy"><span class="section-kicker">01 · 关于你</span><h3>先建立可信的候选人画像。</h3><p>这些信息只保存在当前浏览器，用来调整岗位、任务和表达方式。</p></div>' +
        '<div class="form-grid"><label class="field"><span>姓名 / 称呼</span><input name="name" value="' + escapeHTML(draft.name || "") + '" required autofocus /></label>' +
        '<label class="field"><span>毕业年份</span><select name="gradYear"><option ' + (draft.gradYear === "2026" ? "selected" : "") + '>2026</option><option ' + (draft.gradYear === "2027" ? "selected" : "") + '>2027</option><option ' + (draft.gradYear === "2028" ? "selected" : "") + '>2028</option></select></label>' +
        '<label class="field"><span>学校</span><input name="school" value="' + escapeHTML(draft.school || "") + '" placeholder="可填写简称" /></label>' +
        '<label class="field"><span>专业</span><input name="major" value="' + escapeHTML(draft.major || "") + '" placeholder="例如：信息管理" /></label></div>'
      );
    }
    if (step === 1) {
      return (
        '<div class="onboarding-step-copy"><span class="section-kicker">02 · 去哪里</span><h3>先选择值得验证的方向，而不是承诺一生。</h3><p>Agent 会把方向当作假设，用岗位样本和你的证据逐步校准。</p></div>' +
        '<div class="form-grid"><label class="field"><span>目标方向</span><input name="targetTrack" value="' + escapeHTML(draft.targetTrack || "") + '" placeholder="产品 / 数据 / 运营" required /></label>' +
        '<label class="field"><span>目标行业</span><input name="targetCompany" value="' + escapeHTML(draft.targetCompany || "") + '" placeholder="互联网、SaaS、消费科技..." /></label>' +
        '<label class="field"><span>目标城市</span><input name="cities" value="' + escapeHTML(draft.cities || "") + '" placeholder="上海、杭州" /></label>' +
        '<label class="field"><span>每周可投入小时</span><input name="weeklyHours" type="number" min="1" max="60" value="' + escapeHTML(draft.weeklyHours || 10) + '" /></label></div>'
      );
    }
    return (
      '<div class="onboarding-step-copy"><span class="section-kicker">03 · 现实条件</span><h3>最后，让计划适配你的真实生活。</h3><p>可投入时间、已有经历和限制同样重要。Agent 不会用理想状态替你排计划。</p></div>' +
      '<div class="form-grid"><label class="field field-wide"><span>现有经历水平</span><input name="experienceLevel" value="' + escapeHTML(draft.experienceLevel || "") + '" placeholder="例如：1 段校园项目、暂无实习" /></label>' +
      '<label class="field field-wide"><span>最强能力</span><input name="strongest" value="' + escapeHTML(draft.strongest || "") + '" placeholder="例如：用户研究、数据分析、沟通" /></label>' +
      '<label class="field field-wide"><span>现实约束</span><textarea name="constraints" rows="3" placeholder="课程、毕设、实习、地域、时间或其他限制">' + escapeHTML(draft.constraints || "") + '</textarea></label></div>' +
      '<div class="onboarding-preview"><span class="section-kicker">你的初始主线</span><div><strong>' + escapeHTML(draft.targetTrack || "待确定方向") + '</strong><span>' + escapeHTML(draft.gradYear || "") + ' 届 · ' + escapeHTML(draft.cities || "城市待定") + ' · ' + escapeHTML(draft.weeklyHours || 10) + 'h/周</span></div><p>完成后会生成第一版 7 天行动计划，之后可以随时让 Agent 重排。</p></div>'
    );
  }

  function openOnboardingModal(step) {
    ui.onboardingStep = clamp(Number(step) || 0, 0, 2);
    const draft = onboardingDraftValues();
    const progress = [0, 1, 2].map((index) => '<span class="' + (index <= ui.onboardingStep ? "is-active" : "") + '"></span>').join("");
    const actionButtons =
      '<div class="onboarding-actions">' +
      '<button type="button" class="text-button" data-action="onboarding-demo">先浏览示例</button>' +
      '<div>' + (ui.onboardingStep > 0 ? '<button type="button" class="button button-secondary" data-action="onboarding-back">上一步</button>' : "") +
      '<button type="submit" class="button button-primary">' + (ui.onboardingStep === 2 ? icon("sparkles", 16) + "生成我的求职方案" : "下一步" + icon("arrow-right", 15)) + '</button></div></div>';
    const content =
      '<form id="onboarding-form" class="modal-form onboarding-form" data-step="' + ui.onboardingStep + '">' +
      '<div class="onboarding-progress"><div>' + progress + '</div><span>第 ' + (ui.onboardingStep + 1) + ' / 3 步</span></div>' +
      onboardingStepContent(ui.onboardingStep, draft) +
      actionButtons + '</form>';
    openModal(content, { title: "建立你的求职主线", kicker: "首次设置", label: "求职引导", className: "modal-wide onboarding-modal" });
  }

  function captureOnboardingDraft(form) {
    if (!form) return;
    const data = new FormData(form);
    const draft = Object.assign({}, ui.onboardingDraft || {});
    ["name", "gradYear", "school", "major", "targetTrack", "targetCompany", "cities", "weeklyHours", "experienceLevel", "strongest", "constraints"].forEach((key) => {
      if (data.has(key)) draft[key] = data.get(key);
    });
    if (draft.weeklyHours) draft.weeklyHours = clamp(Number(draft.weeklyHours) || 10, 1, 60);
    ui.onboardingDraft = draft;
  }

  function completeOnboarding(form) {
    captureOnboardingDraft(form);
    state.profile = Object.assign({}, state.profile, ui.onboardingDraft || {});
    state.onboardingComplete = true;
    const plan = generatePlan(state.profile, state.tasks);
    state.tasks = plan.tasks;
    state.planVersion = (state.planVersion || 1) + 1;
    state.messages.push({
      role: "assistant",
      text: "画像已经建立。我先根据你每周 " + state.profile.weeklyHours + " 小时的投入，把第一版行动方案压缩到最关键的几步。\n\n先去证据库补一条最有岗位相关性的经历，再开始简历诊断。",
      time: nowTime(),
      actions: [{ label: "完善证据库", view: "evidence" }, { label: "查看行动计划", view: "plan" }]
    });
    ui.onboardingStep = 0;
    ui.onboardingDraft = null;
    ui.view = "dashboard";
    saveState();
    closeModal();
    render();
    showToast("你的个性化求职主线已生成");
  }

  function openLlmSettingsModal() {
    const cfg = window.CareerOS.llm.getConfig();
    const status = window.CareerOS.llm.getServerStatus();
    const secure = Boolean(status.llmConfigured);
    const serverUnavailable = status.checked && !status.available;
    const presetOptions = Object.keys(window.CareerOS.llm.presets).map((key) => {
      const p = window.CareerOS.llm.presets[key];
      return '<option value="' + key + '"' + (cfg.preset === key ? " selected" : "") + '>' + escapeHTML(p.label) + '</option>';
    }).join("");
    const statusCopy = secure
      ? '<div class="llm-status-card is-secure"><span class="llm-status-icon">' + icon("shield-check", 20) + '</span><div><strong>安全代理已连接</strong><p>API Key 保存在服务端环境变量中，浏览器不会接触密钥。当前模型：' + escapeHTML(status.model || "服务端默认模型") + '</p></div><span class="tag tag-green">推荐</span></div>'
      : serverUnavailable
        ? '<div class="llm-status-card"><span class="llm-status-icon">' + icon("info", 20) + '</span><div><strong>当前为静态模式</strong><p>没有检测到本地服务。可在下方临时启用浏览器直连，或运行 node server.js 使用安全代理。</p></div><span class="tag tag-neutral">本地</span></div>'
        : '<div class="llm-status-card"><span class="llm-status-icon">' + icon("server", 20) + '</span><div><strong>模型服务尚未配置</strong><p>启动服务端并配置 .env 后会自动启用；当前继续使用规则降级。</p></div><span class="tag tag-neutral">未配置</span></div>';
    const directFields = secure
      ? '<div class="modal-note">' + icon("lock", 16) + '<span>浏览器直连配置不会覆盖服务端安全代理。推荐始终通过 .env 管理模型密钥。</span></div>'
      : '<label class="field"><span>模型服务</span><select name="preset" id="llm-preset">' + presetOptions + '</select></label>' +
        '<label class="field"><span>直连 API Key（仅当前会话）</span><input name="apiKey" type="password" value="' + escapeHTML(cfg.apiKey || "") + '" placeholder="sk-..." autocomplete="off" /></label>' +
        '<label class="field"><span>接口地址 baseUrl</span><input name="baseUrl" id="llm-baseurl" value="' + escapeHTML(cfg.baseUrl || "") + '" placeholder="https://api.deepseek.com/v1" /></label>' +
        '<label class="field"><span>模型名 model</span><input name="model" id="llm-model" value="' + escapeHTML(cfg.model || "") + '" placeholder="deepseek-chat" /></label>' +
        '<div class="modal-note">' + icon("triangle-alert", 16) + '<span>直连模式会把请求直接发往模型厂商，仅建议在本地静态体验时使用。Key 只保存在当前标签页的 sessionStorage。</span></div>';
    const actions = secure
      ? '<div class="modal-actions"><button type="button" class="button button-secondary" data-action="close-modal">关闭</button><button type="button" class="button button-primary" data-action="test-llm">测试安全网关</button></div>'
      : '<div class="modal-actions"><button type="button" class="button button-secondary" data-action="close-modal">取消</button><button type="button" class="button button-secondary" data-action="test-llm">测试当前连接</button><button type="submit" class="button button-primary">保存模型设置</button></div>';
    const content =
      '<form id="llm-form" class="modal-form">' + statusCopy + directFields + actions + '</form>';
    openModal(content, { title: "模型网关", kicker: "AI Runtime", label: "模型网关", className: "modal-wide" });
    const preset = document.getElementById("llm-preset");
    if (preset) {
      preset.addEventListener("change", () => {
        const p = window.CareerOS.llm.presets[preset.value];
        if (p) {
          document.getElementById("llm-baseurl").value = p.baseUrl;
          document.getElementById("llm-model").value = p.model;
        }
      });
    }
    window.CareerOS.llm.refreshServerStatus(true).then(() => renderModelStatus());
  }

  function openJobModal(jobId) {
    const existing = (state.jobTargets || []).find((item) => item.id === jobId) || null;
    const content =
      '<form id="job-form" class="modal-form">' +
      '<input type="hidden" name="jobId" value="' + escapeHTML(existing ? existing.id : "") + '" />' +
      '<div class="form-grid">' +
      '<label class="field"><span>公司</span><input name="company" value="' + escapeHTML(existing ? existing.company : "") + '" required /></label>' +
      '<label class="field"><span>岗位</span><input name="role" value="' + escapeHTML(existing ? existing.role : "") + '" required /></label>' +
      '<label class="field"><span>城市</span><input name="city" value="' + escapeHTML(existing ? existing.city : "") + '" /></label>' +
      '<label class="field"><span>来源</span><input name="source" value="' + escapeHTML(existing ? existing.source : "") + '" placeholder="官网 / 内推 / 招聘平台" /></label>' +
      '<label class="field"><span>截止日期</span><input name="deadline" type="date" value="' + escapeHTML(existing ? existing.deadline : "") + '" /></label>' +
      '<label class="field"><span>优先级</span><select name="priority"><option ' + ((existing ? existing.priority : "P1") === "P0" ? "selected" : "") + '>P0</option><option ' + ((existing ? existing.priority : "P1") === "P1" ? "selected" : "") + '>P1</option><option ' + ((existing ? existing.priority : "P1") === "P2" ? "selected" : "") + '>P2</option></select></label>' +
      '<label class="field"><span>状态</span><select name="status"><option value="active" ' + ((existing ? existing.status : "active") === "active" ? "selected" : "") + '>研究中</option><option value="archived" ' + ((existing ? existing.status : "active") === "archived" ? "selected" : "") + '>已归档</option></select></label>' +
      '<label class="field"><span>岗位来源链接</span><input name="sourceUrl" value="' + escapeHTML(existing ? existing.sourceUrl : "") + '" placeholder="可选" /></label>' +
      '<label class="field field-wide"><span>岗位 JD</span><textarea name="jd" rows="9" placeholder="粘贴完整岗位职责与任职要求，分析会使用真实文本。">' + escapeHTML(existing ? existing.jd : "") + '</textarea></label>' +
      '<label class="field field-wide"><span>研究备注</span><textarea name="notes" rows="3" placeholder="业务阶段、面试风格、岗位重点或需要验证的问题">' + escapeHTML(existing ? existing.notes : "") + '</textarea></label>' +
      '</div><div class="modal-actions">' +
      (existing ? '<button type="button" class="button button-secondary button-danger-ghost" data-action="delete-job" data-job-id="' + escapeHTML(existing.id) + '">删除岗位</button>' : "") +
      '<button type="button" class="button button-secondary" data-action="close-modal">取消</button><button type="submit" class="button button-primary">保存岗位研究</button></div></form>';
    openModal(content, { title: existing ? "更新目标岗位" : "新增目标岗位", kicker: "Job Research", label: "目标岗位", className: "modal-wide" });
  }

  function openEvidenceModal(evidenceId) {
    const existing = (state.evidence || []).find((item) => item.id === evidenceId) || null;
    const typeOptions = ["项目", "课程项目", "实习", "校园经历", "其他"].map((type) => '<option' + ((existing ? existing.type : "项目") === type ? " selected" : "") + '>' + type + '</option>').join("");
    const content =
      '<form id="evidence-form" class="modal-form">' +
      '<input type="hidden" name="evidenceId" value="' + escapeHTML(existing ? existing.id : "") + '" />' +
      '<div class="form-grid">' +
      '<label class="field"><span>证据名称</span><input name="title" value="' + escapeHTML(existing ? existing.title : "") + '" placeholder="例如：校园二手交易平台" required /></label>' +
      '<label class="field"><span>类型</span><select name="type">' + typeOptions + '</select></label>' +
      '<label class="field"><span>你的角色</span><input name="role" value="' + escapeHTML(existing ? existing.role : "") + '" placeholder="产品负责人 / 核心成员" /></label>' +
      '<label class="field"><span>时间</span><input name="period" value="' + escapeHTML(existing ? existing.period : "") + '" placeholder="2026.03 - 2026.06" /></label>' +
      '<fieldset class="field field-wide star-editor"><legend>事实结构</legend>' +
      '<label><span>S 情境</span><textarea name="situation" rows="2" placeholder="当时的背景、约束和挑战">' + escapeHTML(existing ? existing.situation : "") + '</textarea></label>' +
      '<label><span>A 行动</span><textarea name="action" rows="3" placeholder="你做了哪些关键判断和动作">' + escapeHTML(existing ? existing.action : "") + '</textarea></label>' +
      '<label><span>R 结果</span><textarea name="result" rows="2" placeholder="结果是什么，尽量使用可验证事实">' + escapeHTML(existing ? existing.result : "") + '</textarea></label>' +
      '</fieldset>' +
      '<label class="field"><span>量化指标</span><input name="metrics" value="' + escapeHTML(existing && Array.isArray(existing.metrics) ? existing.metrics.join("、") : "") + '" placeholder="用逗号或顿号分隔" /></label>' +
      '<label class="field"><span>能力标签</span><input name="skills" value="' + escapeHTML(existing && Array.isArray(existing.skills) ? existing.skills.join("、") : "") + '" placeholder="用户研究、数据分析" /></label>' +
      '<label class="field"><span>证据强度 0-100</span><input name="confidence" type="number" min="0" max="100" value="' + Number(existing ? existing.confidence : 70) + '" /></label>' +
      '</div>' +
      '<div class="modal-actions">' +
      (existing ? '<button type="button" class="button button-secondary button-danger-ghost" data-action="delete-evidence" data-evidence-id="' + escapeHTML(existing.id) + '">删除证据</button>' : "") +
      '<button type="button" class="button button-secondary" data-action="close-modal">取消</button><button type="submit" class="button button-primary">保存证据</button></div></form>';
    openModal(content, { title: existing ? "更新证据" : "新增一条证据", kicker: "Evidence Vault", label: "证据条目", className: "modal-wide" });
  }

  function openApplicationModal(applicationId) {
    const existing = (state.applications || []).find((item) => item.id === applicationId) || null;
    const today = new Date().toISOString().slice(0, 10);
    const stageOptions = PIPELINE_STAGES.map((stage) => '<option value="' + stage.id + '"' + ((existing ? existing.stage : "applied") === stage.id ? " selected" : "") + '>' + stage.label + '</option>').join("");
    const content =
      '<form id="application-form" class="modal-form">' +
      '<input type="hidden" name="applicationId" value="' + escapeHTML(existing ? existing.id : "") + '" />' +
      '<div class="form-grid">' +
      '<label class="field"><span>公司</span><input name="company" value="' + escapeHTML(existing ? existing.company : "") + '" placeholder="例如：云帆科技" required /></label>' +
      '<label class="field"><span>岗位</span><input name="role" value="' + escapeHTML(existing ? existing.role : "") + '" placeholder="例如：产品运营实习生" required /></label>' +
      '<label class="field"><span>城市</span><input name="city" value="' + escapeHTML(existing ? existing.city : state.profile.cities.split("、")[0] || "") + '" /></label>' +
      '<label class="field"><span>来源</span><input name="source" value="' + escapeHTML(existing ? existing.source : "") + '" placeholder="官网 / 内推 / 招聘平台" /></label>' +
      '<label class="field"><span>当前阶段</span><select name="stage">' + stageOptions + '</select></label>' +
      '<label class="field"><span>匹配度</span><input name="fit" type="number" min="0" max="100" value="' + Number(existing ? existing.fit : 70) + '" /></label>' +
      '<label class="field"><span>投递日期</span><input name="appliedAt" type="date" value="' + escapeHTML(existing ? existing.appliedAt : today) + '" /></label>' +
      '<label class="field"><span>下一步时间</span><input name="nextAt" type="date" value="' + escapeHTML(existing ? existing.nextAt : "") + '" /></label>' +
      '<label class="field field-wide"><span>下一步行动</span><input name="nextAction" value="' + escapeHTML(existing ? existing.nextAction : "") + '" placeholder="例如：跟进内推 / 准备二面案例" /></label>' +
      '<label class="field field-wide"><span>备注</span><textarea name="notes" rows="3" placeholder="面试风格、岗位重点、需要补的材料...">' + escapeHTML(existing ? existing.notes : "") + '</textarea></label>' +
      '<label class="field field-wide"><span>已收到的反馈</span><textarea name="feedback" rows="3" placeholder="只记录真实反馈，不要根据结果猜原因">' + escapeHTML(existing ? existing.feedback : "") + '</textarea></label>' +
      '</div>' +
      '<div class="modal-actions">' +
      (existing ? '<button type="button" class="button button-secondary button-danger-ghost" data-action="delete-application" data-application-id="' + escapeHTML(existing.id) + '">删除记录</button>' : "") +
      '<button type="button" class="button button-secondary" data-action="close-modal">取消</button><button type="submit" class="button button-primary">保存投递记录</button></div></form>';
    openModal(content, { title: existing ? "更新投递记录" : "新增投递记录", kicker: "Application Pipeline", label: "投递记录", className: "modal-wide" });
  }

  function openTaskModal() {
    const content =
      '<form id="task-form" class="modal-form">' +
      '<label class="field"><span>任务名称</span><input name="title" placeholder="例如：拆解 3 个目标岗位" required /></label>' +
      '<label class="field"><span>具体动作</span><textarea name="detail" rows="3" placeholder="写清楚完成标准，避免只写“优化简历”"></textarea></label>' +
      '<div class="form-grid"><label class="field"><span>类别</span><select name="category"><option value="resume">简历</option><option value="research">岗位研究</option><option value="interview">面试</option><option value="application">投递</option><option value="network">人脉</option><option value="review">复盘</option></select></label><label class="field"><span>预计分钟</span><input name="duration" type="number" min="5" max="240" value="25" /></label></div>' +
      '<div class="form-grid"><label class="field"><span>安排日期</span><select name="day"><option>今天</option><option>明天</option><option>周三</option><option>周四</option><option>周五</option><option>周六</option><option>周日</option></select></label><label class="field"><span>优先级</span><select name="priority"><option>P0</option><option>P1</option><option>P2</option></select></label></div>' +
      '<div class="modal-actions"><button type="button" class="button button-secondary" data-action="close-modal">取消</button><button type="submit" class="button button-primary">加入本周计划</button></div></form>';
    openModal(content, { title: "添加一个关键动作", kicker: "行动计划", label: "添加任务" });
  }

  function openSkillsModal() {
    const skills = window.CareerAgent.registry.list().concat([window.CareerAgent.fallbackSkill.manifest]);
    const content =
      '<div class="skill-modal-intro"><span class="skill-runtime-icon">' + icon("blocks", 24) + '</span><div><p>Skill Registry 是职途 Agent 的能力扩展点。每个 Skill 独立声明意图、权限和输出，不直接耦合页面。</p><code>CareerAgent.registry.register(skill)</code></div></div>' +
      '<div class="skill-modal-list">' + skills.map((skill) => '<article class="skill-modal-item"><div class="skill-modal-head"><span class="status-dot"></span><div><strong>' + escapeHTML(skill.name) + '</strong><code>' + escapeHTML(skill.id) + '</code></div><span class="tag tag-green">在线</span></div><p>' + escapeHTML(skill.description) + '</p><div class="permission-list">' + skill.permissions.map((permission) => '<span>' + escapeHTML(permission) + '</span>').join("") + '</div></article>').join("") + '</div>' +
      '<div class="modal-note">' + icon("info", 16) + '<span>本版使用本地规则适配器跑通链路。接入模型和真实岗位数据后，Skill 的输入输出协议保持不变。</span></div>';
    openModal(content, { title: "Skill 运行台", kicker: "Agent Foundation", label: "Skill 运行台", className: "modal-wide" });
  }

  function showToast(message, tone) {
    const toast = document.createElement("div");
    toast.className = "toast " + (tone ? "toast-" + tone : "");
    toast.innerHTML = icon(tone === "error" ? "triangle-alert" : "check", 16) + "<span>" + escapeHTML(message) + "</span>";
    $("#toast-root").appendChild(toast);
    window.setTimeout(() => toast.classList.add("is-visible"), 20);
    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 240);
    }, 2800);
  }

  function navigate(view) {
    if (!VIEW_META[view]) return;
    ui.view = view;
    ui.sidebarOpen = false;
    ui.agentOpen = false;
    render();
    $("#main-content").focus({ preventScroll: true });
  }

  async function submitAgentMessage(text) {
    const message = String(text || "").trim();
    if (!message || ui.typing) return;
    state.messages.push({ role: "user", text: message, time: nowTime() });
    ui.typing = true;
    renderAgent();
    saveState();
    await new Promise((resolve) => window.setTimeout(resolve, 520));
    const context = {
      state: state,
      generatePlan: generatePlan,
      profileCompleteness: profileCompleteness,
      llm: window.CareerOS && window.CareerOS.llm ? window.CareerOS.llm.createLlmAdapter() : null,
      jobFit: window.CareerOS && window.CareerOS.jobFit ? window.CareerOS.jobFit : null,
    };
    const result = await window.CareerAgent.orchestrator.handle(message, context);
    if (result.preset) {
      state.interview.mode = result.preset.mode;
      state.interview.intensity = result.preset.intensity;
    }
    state.messages.push({
      role: "assistant",
      text: result.text,
      actions: result.actions || [],
      skillId: result.skillId,
      time: nowTime(),
    });
    ui.suggestions = result.suggestions || [];
    ui.typing = false;
    saveState();
    render();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function scoreResume(text, jd) {
    const clean = String(text || "").replace(/\s/g, "");
    if (!clean) {
      return {
        score: 0,
        dimensions: [
          { label: "结构清晰", value: 0 },
          { label: "成果量化", value: 0 },
          { label: "岗位相关", value: 0 },
          { label: "表达密度", value: 0 },
        ],
        issues: ["还没有简历正文。", "尚未设置目标岗位描述。", "无法进行关键词匹配。"],
        lastReviewed: new Date().toISOString(),
      };
    }
    const numberMatches = String(text).match(/\d+(?:\.\d+)?%?|[一二三四五六七八九十]+人/g) || [];
    const actionMatches = String(text).match(/主导|负责|推动|设计|优化|搭建|分析|落地|协调|访谈|验证/g) || [];
    const sectionMatches = String(text).match(/教育经历|项目经历|实习经历|校园经历|技能|奖项/g) || [];
    const keywords = ["数据", "用户", "产品", "分析", "运营", "增长", "项目", "协作", "SQL", "Excel", "实验", "指标", "需求", "复盘"];
    const hits = keywords.filter((keyword) => clean.includes(keyword.toLowerCase()) || String(text).toLowerCase().includes(keyword.toLowerCase()));
    const jdHits = keywords.filter((keyword) => String(jd || "").toLowerCase().includes(keyword.toLowerCase()));
    const overlap = jdHits.filter((keyword) => hits.includes(keyword));
    const structure = clamp(45 + Math.min(28, sectionMatches.length * 6) + Math.min(18, clean.length / 120), 38, 94);
    const achievements = clamp(30 + numberMatches.length * 6 + actionMatches.length * 2, 22, 94);
    const relevance = clamp(36 + overlap.length * 8 + Math.min(15, hits.length * 2), 28, 95);
    const density = clamp(92 - Math.max(0, clean.length - 1250) / 24 - Math.max(0, 340 - clean.length) / 10 + sectionMatches.length * 2, 28, 92);
    const dimensions = [
      { label: "结构清晰", value: Math.round(structure) },
      { label: "成果量化", value: Math.round(achievements) },
      { label: "岗位相关", value: Math.round(relevance) },
      { label: "表达密度", value: Math.round(density) },
    ];
    const issues = [];
    if (numberMatches.length < 5) issues.push("可验证结果不足：项目经历里的数字、对比或变化偏少。");
    if (overlap.length < Math.max(4, Math.ceil(jdHits.length * 0.45))) issues.push("目标 JD 关键词覆盖不足：分析、实验、指标等岗位语言出现较少。");
    if (!/求职方向|求职意向|目标岗位/.test(text)) issues.push("第一屏没有明确求职方向，招聘方需要自行推断你的目标。");
    if (actionMatches.length < 5) issues.push("动作动词重复或偏弱，难以判断你实际做了什么决策。");
    if (issues.length < 3) issues.push("项目成就与岗位要求之间还缺少一句明确的迁移说明。");
    return {
      score: Math.round((structure + achievements + relevance + density) / 4),
      dimensions: dimensions,
      issues: issues.slice(0, 3),
      lastReviewed: new Date().toISOString(),
    };
  }

  function evaluateInterviewAnswer(answer) {
    const clean = String(answer || "").replace(/\s/g, "");
    const feedback = [];
    let score = 45;
    if (clean.length < 80) {
      score -= 16;
      feedback.push("回答偏短。先补充背景和你的具体动作，否则面试官无法判断能力边界。");
    } else if (clean.length > 420) {
      score -= 5;
      feedback.push("回答信息量足够，但铺垫偏长。把结论放到第一句，控制在 90 秒内。");
    } else {
      score += 8;
      feedback.push("回答长度合适，具备被继续追问的空间。");
    }
    if (/\d|%|万|千|百|提升|下降|增长|缩短|留存|转化/.test(answer)) {
      score += 15;
      feedback.push("出现了结果或指标证据，这是有效回答的关键。");
    } else {
      score -= 8;
      feedback.push("缺少可验证结果。至少补一个数字、对比或明确变化。");
    }
    if (/(背景|目标|首先|然后|最后|结果|复盘|权衡)/.test(answer)) {
      score += 10;
      feedback.push("回答有清晰层次，面试官更容易跟上你的判断过程。");
    } else {
      feedback.push("结构可以更明确：背景一句、任务一句、行动两句、结果一句。");
    }
    if (/(我决定|我判断|我负责|我认为|我的取舍|我选择)/.test(answer)) {
      score += 6;
      feedback.push("能够区分个人贡献，没有被“我们”掩盖。");
    } else {
      feedback.push("补充你个人做出的关键判断，避免只描述团队动作。");
    }
    if (state.interview.mode === "stress" && /(不认同|实际上|更准确地说|我理解你的质疑|证据是)/.test(answer)) {
      score += 5;
      feedback.push("面对质疑时没有防御性绕开，而是直接回到证据。");
    }
    return { score: clamp(Math.round(score), 25, 94), feedback: feedback.slice(0, 4) };
  }

  function toggleTask(id) {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;
    task.done = !task.done;
    saveState();
    render();
    showToast(task.done ? "已完成：" + task.title : "已恢复：" + task.title, task.done ? "success" : "");
  }

  function addTasksFromGaps(tasks) {
    tasks.forEach((task) => state.tasks.push(Object.assign({ id: makeId("gap"), day: "本周", category: "resume", duration: 25, done: false, priority: "P1" }, task)));
    saveState();
    ui.view = "plan";
    render();
    showToast("已把 " + tasks.length + " 个证据缺口加进计划");
  }

  function saveProfile(form) {
    const data = new FormData(form);
    const oldTarget = state.profile.targetTrack;
    state.profile.name = String(data.get("name") || "").trim() || state.profile.name;
    state.profile.gradYear = String(data.get("gradYear") || state.profile.gradYear);
    state.profile.school = String(data.get("school") || "").trim();
    state.profile.major = String(data.get("major") || "").trim();
    state.profile.targetTrack = String(data.get("targetTrack") || "").trim();
    state.profile.targetCompany = String(data.get("targetCompany") || "").trim();
    state.profile.cities = String(data.get("cities") || "").trim();
    state.profile.weeklyHours = clamp(Number(data.get("weeklyHours")) || 10, 1, 80);
    state.profile.experienceLevel = String(data.get("experienceLevel") || "").trim();
    state.profile.strongest = String(data.get("strongest") || "").trim();
    state.profile.constraints = String(data.get("constraints") || "").trim();
    if (oldTarget !== state.profile.targetTrack) {
      state.memory.push({ type: "goal-change", content: "目标方向从 " + oldTarget + " 调整为 " + state.profile.targetTrack, createdAt: new Date().toISOString() });
    }
    saveState();
    closeModal();
    render();
    showToast("画像已更新，Agent 将在下一轮对话中使用");
  }

  function saveResume(form) {
    const data = new FormData(form);
    state.resume.text = String(data.get("resumeText") || "").trim();
    state.resume.targetJD = String(data.get("targetJD") || "").trim();
    const review = scoreResume(state.resume.text, state.resume.targetJD);
    state.resume.score = review.score;
    state.resume.dimensions = review.dimensions;
    state.resume.issues = review.issues;
    state.resume.lastReviewed = review.lastReviewed;
    saveState();
    render();
    showToast("诊断完成：简历匹配分 " + review.score + "/100");
  }

  function handleInterviewAnswer(form) {
    const data = new FormData(form);
    const answer = String(data.get("answer") || "").trim();
    if (answer.replace(/\s/g, "").length < 20) {
      showToast("先写至少 20 个字的回答，再提交反馈", "error");
      return;
    }
    const questions = getInterviewQuestions();
    const current = questions[state.interview.index];
    const evaluation = evaluateInterviewAnswer(answer);
    state.interview.history.push({
      title: current.title,
      question: current.prompt,
      answer: answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      createdAt: new Date().toISOString(),
    });
    state.interview.score = Math.round(state.interview.history.reduce((sum, item) => sum + item.score, 0) / state.interview.history.length);
    state.interview.index += 1;
    state.interview.done = state.interview.index >= questions.length;
    saveState();
    render();
    showToast("本轮反馈已生成：" + evaluation.score + " 分", "success");
  }

  function startInterview() {
    state.interview.started = true;
    state.interview.done = false;
    state.interview.index = 0;
    state.interview.history = [];
    state.interview.score = 0;
    saveState();
    ui.view = "interview";
    render();
    showToast(state.interview.mode === "stress" ? "压力模式已开始，回答会被连续追问" : "模拟面试已开始");
  }

  function downloadPlan() {
    const lines = [
      "职途 Career OS - 本周行动计划",
      "候选人：" + state.profile.name,
      "方向：" + state.profile.targetTrack,
      "可用时间：" + state.profile.weeklyHours + " 小时/周",
      "",
      state.tasks.map((task, index) => (index + 1) + ". [" + (task.done ? "x" : " ") + "] " + task.day + " · " + task.title + "（" + task.duration + " min）\n   " + task.detail).join("\n"),
      "",
      "由职途 Agent 生成，请根据真实反馈持续调整。",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "职途_本周行动计划.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("本周计划已导出");
  }

  function exportCareerReport() {
    const readiness = getReadiness();
    const evidence = Array.isArray(state.evidence) ? state.evidence : [];
    const applications = Array.isArray(state.applications) ? state.applications : [];
    const lines = [
      "# 职途 Career OS 求职档案",
      "",
      "导出时间：" + new Date().toLocaleString("zh-CN"),
      "",
      "## 候选人画像",
      "",
      "- 姓名：" + state.profile.name,
      "- 学校：" + state.profile.school,
      "- 专业：" + state.profile.major,
      "- 毕业年份：" + state.profile.gradYear,
      "- 目标方向：" + state.profile.targetTrack,
      "- 目标行业：" + state.profile.targetCompany,
      "- 目标城市：" + state.profile.cities,
      "- 每周投入：" + state.profile.weeklyHours + " 小时",
      "- 现实约束：" + (state.profile.constraints || "未填写"),
      "",
      "## 求职就绪度",
      "",
      "- 综合：" + readiness.total + "/100",
      "- 方向定位：" + readiness.positioning,
      "- 简历材料：" + readiness.resume,
      "- 面试准备：" + readiness.interview,
      "- 投递反馈：" + readiness.pipeline,
      "",
      "## 证据库",
      ""
    ];
    evidence.forEach((item, index) => {
      lines.push("### " + (index + 1) + ". " + item.title);
      lines.push("");
      lines.push("- 类型：" + item.type);
      lines.push("- 角色：" + item.role);
      lines.push("- 时间：" + item.period);
      lines.push("- 证据强度：" + item.confidence);
      lines.push("- 情境：" + item.situation);
      lines.push("- 行动：" + item.action);
      lines.push("- 结果：" + item.result);
      lines.push("- 指标：" + ((item.metrics || []).join("、") || "未填写"));
      lines.push("- 能力：" + ((item.skills || []).join("、") || "未填写"));
      lines.push("");
    });
    lines.push("## 投递看板", "");
    applications.forEach((item, index) => {
      lines.push("### " + (index + 1) + ". " + item.company + " · " + item.role);
      lines.push("");
      lines.push("- 阶段：" + pipelineStage(item.stage).label);
      lines.push("- 城市：" + item.city);
      lines.push("- 来源：" + item.source);
      lines.push("- 匹配度：" + item.fit);
      lines.push("- 下一步：" + (item.nextAction || "未设置"));
      lines.push("- 反馈：" + (item.feedback || "尚未记录"));
      lines.push("");
    });
    lines.push("## 本周行动", "");
    state.tasks.forEach((task) => {
      lines.push("- [" + (task.done ? "x" : " ") + "] " + task.day + " · " + task.title + "（" + task.duration + " 分钟）");
    });
    lines.push("");
    lines.push("## 面试训练", "");
    lines.push("- 完成回答：" + state.interview.history.length);
    lines.push("- 当前平均分：" + (state.interview.score || 0));
    lines.push("");
    lines.push("---");
    lines.push("由职途 Career OS 导出。模型建议不能替代用户对事实真实性的确认。");
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "职途_求职档案_" + new Date().toISOString().slice(0, 10) + ".md";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast("求职档案已导出");
  }

  function showResetConfirm() {
    const content =
      '<div class="danger-panel">' + icon("triangle-alert", 22) + '<div><h3>重置所有本地数据？</h3><p>画像、任务完成状态、简历与面试记录都会恢复到演示初始状态，操作不可撤销。</p></div></div>' +
      '<div class="modal-actions"><button class="button button-secondary" data-action="close-modal">保留数据</button><button class="button button-danger" data-action="confirm-reset">确认重置</button></div>';
    openModal(content, { title: "重置演示数据", kicker: "数据管理", label: "重置确认" });
  }

  function resetData() {
    const fresh = createDefaultState();
    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, fresh);
    ui.view = "dashboard";
    ui.planFilter = "all";
    ui.suggestions = state.suggestions.slice();
    saveState();
    closeModal();
    render();
    window.setTimeout(() => openOnboardingModal(0), 250);
    showToast("演示数据已重置");
  }

  async function handleClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const viewNode = target.closest("[data-view]");
    const promptNode = target.closest("[data-prompt]");
    const toggleNode = target.closest("[data-task-toggle]");
    const roleNode = target.closest("[data-role-lock]");
    const modeNode = target.closest("[data-mode]");
    const intensityNode = target.closest("[data-intensity]");
    const filterNode = target.closest("[data-plan-filter]");
    const actionNode = target.closest("[data-action]");

    if (actionNode && actionNode.getAttribute("data-action") === "close-modal" && target.closest("[data-modal-panel]") && !target.closest('button[data-action="close-modal"]')) {
      return;
    }

    if (promptNode) {
      event.preventDefault();
      submitAgentMessage(promptNode.getAttribute("data-prompt"));
      return;
    }

    if (viewNode) {
      event.preventDefault();
      navigate(viewNode.getAttribute("data-view"));
      return;
    }

    if (toggleNode) {
      event.preventDefault();
      toggleTask(toggleNode.getAttribute("data-task-toggle"));
      return;
    }

    if (roleNode) {
      event.preventDefault();
      const role = state.roles.find((item) => item.id === roleNode.getAttribute("data-role-lock"));
      if (role) {
        state.roles.forEach((item) => {
          item.selected = item.id === role.id;
          item.status = item.id === role.id ? "主攻" : item.status === "主攻" ? "备选" : item.status;
        });
        saveState();
        render();
        showToast("已锁定验证方向：" + role.title);
      }
      return;
    }

    if (modeNode) {
      event.preventDefault();
      state.interview.mode = modeNode.getAttribute("data-mode");
      state.interview.started = false;
      state.interview.done = false;
      state.interview.index = 0;
      state.interview.history = [];
      state.interview.score = 0;
      saveState();
      render();
      return;
    }

    if (intensityNode) {
      event.preventDefault();
      state.interview.intensity = intensityNode.getAttribute("data-intensity");
      saveState();
      render();
      return;
    }

    if (filterNode) {
      event.preventDefault();
      ui.planFilter = filterNode.getAttribute("data-plan-filter");
      render();
      return;
    }

    if (actionNode) {
      event.preventDefault();
      const action = actionNode.getAttribute("data-action");
      if (action === "open-agent") {
        ui.agentOpen = true;
        renderShell();
        window.setTimeout(() => $("#agent-input").focus(), 60);
      } else if (action === "close-agent") {
        ui.agentOpen = false;
        renderShell();
      } else if (action === "toggle-sidebar") {
        ui.sidebarOpen = !ui.sidebarOpen;
        renderShell();
      } else if (action === "close-overlays") {
        ui.agentOpen = false;
        ui.sidebarOpen = false;
        closeModal();
        renderShell();
      } else if (action === "start-onboarding") {
        ui.onboardingDraft = Object.assign({}, state.profile);
        openOnboardingModal(0);
      } else if (action === "onboarding-back") {
        captureOnboardingDraft(document.getElementById("onboarding-form"));
        openOnboardingModal(Math.max(0, ui.onboardingStep - 1));
      } else if (action === "onboarding-demo") {
        state.onboardingComplete = true;
        ui.onboardingDraft = null;
        saveState();
        closeModal();
        render();
        showToast("已进入示例模式，可随时从工作台重新开始引导");
      } else if (action === "download-report") {
        exportCareerReport();
      } else if (action === "open-profile") {
        openProfileModal();
      } else if (action === "show-skills") {
        openSkillsModal();
      } else if (action === "open-llm-settings") {
        openLlmSettingsModal();
      } else if (action === "test-llm") {
        const original = actionNode.innerHTML;
        actionNode.disabled = true;
        actionNode.innerHTML = icon("clock-3", 15) + "<span>测试中...</span>";
        try {
          await window.CareerOS.llm.refreshServerStatus(true);
          const result = await window.CareerOS.llm.createLlmAdapter().test();
          showToast("模型连接正常：" + String(result.text || "OK").slice(0, 40), "success");
          renderModelStatus();
        } catch (error) {
          const message = String(error.message || error);
          showToast(message.includes("LLM_NOT_CONFIGURED") ? "尚未配置模型，仍使用本地规则模式" : "模型连接失败：" + message.slice(0, 80), "error");
        } finally {
          actionNode.disabled = false;
          actionNode.innerHTML = original;
          hydrateIcons(actionNode);
        }
      } else if (action === "close-modal") {
        closeModal();
      } else if (action === "open-job") {
        openJobModal(actionNode.getAttribute("data-job-id") || "");
      } else if (action === "delete-job") {
        const jobId = actionNode.getAttribute("data-job-id");
        const job = (state.jobTargets || []).find((item) => item.id === jobId);
        if (job && window.confirm("确定删除岗位「" + job.company + " · " + job.role + "」？")) {
          state.jobTargets = state.jobTargets.filter((item) => item.id !== jobId);
          saveState();
          closeModal();
          render();
          showToast("岗位研究记录已删除");
        }
      } else if (action === "job-to-pipeline") {
        const job = (state.jobTargets || []).find((item) => item.id === actionNode.getAttribute("data-job-id"));
        if (job) {
          const existing = (state.applications || []).find((item) => item.company === job.company && item.role === job.role);
          if (existing) {
            ui.view = "pipeline";
            render();
            showToast("该岗位已在投递看板中");
          } else {
            const analysis = analyzeTargetJob(job);
            const today = new Date().toISOString().slice(0, 10);
            state.applications = state.applications || [];
            state.applications.push({
              id: makeId("application"), company: job.company, role: job.role, city: job.city || "", stage: "applied",
              source: job.source || "岗位研究", appliedAt: today, nextAction: "按 JD 补强证据并完成投递", nextAt: job.deadline || "",
              fit: analysis.score, notes: job.notes || "", feedback: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
            });
            saveState();
            ui.view = "pipeline";
            render();
            showToast("已转入投递看板：" + job.company);
          }
        }
      } else if (action === "open-evidence") {
        openEvidenceModal(actionNode.getAttribute("data-evidence-id") || "");
      } else if (action === "delete-evidence") {
        const evidenceId = actionNode.getAttribute("data-evidence-id");
        const item = (state.evidence || []).find((evidence) => evidence.id === evidenceId);
        if (item && window.confirm("确定删除证据「" + item.title + "」？")) {
          state.evidence = state.evidence.filter((evidence) => evidence.id !== evidenceId);
          saveState();
          closeModal();
          render();
          showToast("证据条目已删除");
        }
      } else if (action === "evidence-to-plan") {
        addTasksFromGaps([
          { title: "补齐核心证据的业务结果", detail: "为每条强证据补充转化率、留存、效率或质量变化，没有数据就标注待验证。", category: "resume", duration: 30 },
          { title: "追问一项关键决策过程", detail: "记录你比较过哪些方案、依据是什么、最后为什么这样选。", category: "review", duration: 20 },
          { title: "把证据改写为 STAR 故事", detail: "选择一条岗位最相关的经历，按情境、任务、行动、结果整理 2 分钟版本。", category: "interview", duration: 25 }
        ]);
      } else if (action === "open-application") {
        openApplicationModal(actionNode.getAttribute("data-application-id") || "");
      } else if (action === "advance-application") {
        const application = (state.applications || []).find((item) => item.id === actionNode.getAttribute("data-application-id"));
        if (application) {
          const index = PIPELINE_STAGES.findIndex((stage) => stage.id === application.stage);
          const next = PIPELINE_STAGES[Math.min(index + 1, PIPELINE_STAGES.length - 1)];
          application.stage = next.id;
          application.updatedAt = new Date().toISOString();
          if (next.id === "closed" && !application.feedback) application.feedback = "流程结束，补充真实反馈后再做归因。";
          saveState();
          render();
          showToast(application.company + " 已推进到「" + next.label + "」");
        }
      } else if (action === "delete-application") {
        const applicationId = actionNode.getAttribute("data-application-id");
        const application = (state.applications || []).find((item) => item.id === applicationId);
        if (application && window.confirm("确定删除 " + application.company + " 的投递记录？")) {
          state.applications = state.applications.filter((item) => item.id !== applicationId);
          saveState();
          closeModal();
          render();
          showToast("投递记录已删除");
        }
      } else if (action === "open-task") {
        openTaskModal();
      } else if (action === "start-interview" || action === "restart-interview") {
        startInterview();
      } else if (action === "generate-plan") {
        const plan = generatePlan(state.profile, state.tasks);
        state.tasks = plan.tasks;
        state.planVersion += 1;
        saveState();
        ui.view = "plan";
        render();
        showToast("计划已按新的时间约束重排");
      } else if (action === "resume-to-plan") {
        addTasksFromGaps([
          { title: "把主项目改写成 STAR 结构", detail: "每个项目至少包含背景、任务、关键决策和结果。" },
          { title: "补充 3 个可验证结果指标", detail: "优先使用留存、转化、参与率、效率变化，而不是只有总人数。" },
          { title: "对照目标 JD 做关键词覆盖", detail: "标出已有证据、可迁移证据和完全缺失的能力。" },
        ]);
      } else if (action === "positioning-to-plan") {
        addTasksFromGaps([
          { title: "建立业务指标词典", detail: "整理 8 个产品运营常用指标及其业务含义。" },
          { title: "完成一个最小实验设计", detail: "围绕校园产品设计 A/B 或前后对照，写清目标和判定标准。" },
          { title: "访谈一位目标岗位从业者", detail: "确认真实工作场景、考核方式与常见误区。" },
        ]);
      } else if (action === "upload-resume") {
        const fileInput = $("#resume-file");
        if (fileInput) fileInput.click();
      } else if (action === "show-jd-help") {
        showToast("把目标岗位完整 JD 粘贴到下方文本框，诊断会提高匹配权重");
      } else if (action === "download-plan") {
        downloadPlan();
      } else if (action === "reset-data") {
        showResetConfirm();
      } else if (action === "confirm-reset") {
        resetData();
      } else if (action === "focus-next-task") {
        const task = nextTask();
        if (task) {
          showToast("专注任务：" + task.title + " · " + task.duration + " 分钟");
          toggleTask(task.id);
        } else {
          showToast("当前任务已经完成");
        }
      } else if (action === "focus-task") {
        const taskId = actionNode.getAttribute("data-task-id");
        const task = state.tasks.find((item) => item.id === taskId);
        if (task) {
          ui.view = "plan";
          ui.planFilter = task.category;
          render();
        }
      } else if (action === "focus-agent") {
        ui.agentOpen = true;
        renderShell();
        $("#agent-input").focus();
      }
    }
  }

  async function handleSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.id === "agent-form") {
      event.preventDefault();
      const input = $("#agent-input");
      const message = input.value;
      input.value = "";
      submitAgentMessage(message);
      return;
    }
    event.preventDefault();
    if (form.id === "onboarding-form") {
      const step = Number(form.getAttribute("data-step")) || 0;
      captureOnboardingDraft(form);
      if (step < 2) openOnboardingModal(step + 1);
      else completeOnboarding(form);
      return;
    }
    if (form.id === "profile-form" || form.id === "profile-page-form") {
      saveProfile(form);
    } else if (form.id === "resume-form") {
      saveResume(form);
    } else if (form.id === "task-form") {
      const data = new FormData(form);
      state.tasks.push({
        id: makeId("task"),
        day: String(data.get("day") || "今天"),
        title: String(data.get("title") || "").trim(),
        detail: String(data.get("detail") || "").trim() || "按完成标准执行，并在复盘时记录新信息。",
        category: String(data.get("category") || "review"),
        duration: clamp(Number(data.get("duration")) || 25, 5, 240),
        priority: String(data.get("priority") || "P1"),
        done: false,
      });
      saveState();
      closeModal();
      ui.view = "plan";
      render();
      showToast("新任务已加入本周计划");
    } else if (form.id === "job-form") {
      const data = new FormData(form);
      const jobId = String(data.get("jobId") || "").trim();
      const record = {
        id: jobId || makeId("job"),
        company: String(data.get("company") || "").trim(),
        role: String(data.get("role") || "").trim(),
        city: String(data.get("city") || "").trim(),
        source: String(data.get("source") || "").trim(),
        sourceUrl: String(data.get("sourceUrl") || "").trim(),
        deadline: String(data.get("deadline") || ""),
        priority: String(data.get("priority") || "P1"),
        status: String(data.get("status") || "active"),
        jd: String(data.get("jd") || "").trim(),
        notes: String(data.get("notes") || "").trim(),
        updatedAt: new Date().toISOString(),
      };
      state.jobTargets = Array.isArray(state.jobTargets) ? state.jobTargets : [];
      const index = state.jobTargets.findIndex((item) => item.id === jobId);
      if (index >= 0) state.jobTargets[index] = record;
      else state.jobTargets.push(record);
      saveState();
      closeModal();
      ui.view = "jobs";
      render();
      showToast(jobId ? "岗位研究已更新" : "目标岗位已加入研究列表");
    } else if (form.id === "evidence-form") {
      const data = new FormData(form);
      const evidenceId = String(data.get("evidenceId") || "").trim();
      const splitTags = (value) => String(value || "").split(/[，,、]/).map((item) => item.trim()).filter(Boolean);
      const record = {
        id: evidenceId || makeId("evidence"),
        title: String(data.get("title") || "").trim(),
        type: String(data.get("type") || "其他"),
        role: String(data.get("role") || "").trim(),
        period: String(data.get("period") || "").trim(),
        situation: String(data.get("situation") || "").trim(),
        action: String(data.get("action") || "").trim(),
        result: String(data.get("result") || "").trim(),
        metrics: splitTags(data.get("metrics")),
        skills: splitTags(data.get("skills")),
        confidence: clamp(Number(data.get("confidence")) || 0, 0, 100),
        updatedAt: new Date().toISOString(),
      };
      state.evidence = Array.isArray(state.evidence) ? state.evidence : [];
      const existingIndex = state.evidence.findIndex((item) => item.id === evidenceId);
      if (existingIndex >= 0) state.evidence[existingIndex] = record;
      else state.evidence.push(record);
      saveState();
      closeModal();
      ui.view = "evidence";
      render();
      showToast(evidenceId ? "证据已更新" : "新证据已加入证据库");
    } else if (form.id === "application-form") {
      const data = new FormData(form);
      const applicationId = String(data.get("applicationId") || "").trim();
      const stage = String(data.get("stage") || "applied");
      const record = {
        id: applicationId || makeId("application"),
        company: String(data.get("company") || "").trim(),
        role: String(data.get("role") || "").trim(),
        city: String(data.get("city") || "").trim(),
        source: String(data.get("source") || "").trim(),
        stage: PIPELINE_STAGES.some((item) => item.id === stage) ? stage : "applied",
        appliedAt: String(data.get("appliedAt") || ""),
        nextAt: String(data.get("nextAt") || ""),
        nextAction: String(data.get("nextAction") || "").trim(),
        notes: String(data.get("notes") || "").trim(),
        feedback: String(data.get("feedback") || "").trim(),
        fit: clamp(Number(data.get("fit")) || 0, 0, 100),
        updatedAt: new Date().toISOString(),
      };
      state.applications = Array.isArray(state.applications) ? state.applications : [];
      const existingIndex = state.applications.findIndex((item) => item.id === applicationId);
      if (existingIndex >= 0) {
        record.createdAt = state.applications[existingIndex].createdAt || record.updatedAt;
        state.applications[existingIndex] = record;
      } else {
        record.createdAt = record.updatedAt;
        state.applications.push(record);
      }
      saveState();
      closeModal();
      ui.view = "pipeline";
      render();
      showToast(applicationId ? "投递记录已更新" : "投递记录已加入看板");
    } else if (form.id === "interview-form") {
      handleInterviewAnswer(form);
    } else if (form.id === "llm-form") {
      const data = new FormData(form);
      window.CareerOS.llm.saveConfig({
        preset: String(data.get("preset") || "custom"),
        apiKey: String(data.get("apiKey") || "").trim(),
        baseUrl: String(data.get("baseUrl") || "").trim(),
        model: String(data.get("model") || "").trim(),
      });
      await window.CareerOS.llm.refreshServerStatus(true);
      closeModal();
      render();
      const ok = window.CareerOS.llm.createLlmAdapter().configured();
      showToast(ok ? "模型网关已启用" : "已保存，但信息不完整，仍为规则模式");
    }
  }

  async function handleFileChange(event) {
    if (event.target.id !== "resume-file") return;
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name) && !/text/.test(file.type)) {
      showToast("演示版仅支持 .txt / .md，PDF 解析器将在文件 Skill 中接入", "error");
      return;
    }
    try {
      const content = await file.text();
      state.resume.text = content.slice(0, 60000);
      state.resume.fileName = file.name;
      const review = scoreResume(state.resume.text, state.resume.targetJD);
      state.resume.score = review.score;
      state.resume.dimensions = review.dimensions;
      state.resume.issues = review.issues;
      state.resume.lastReviewed = review.lastReviewed;
      saveState();
      render();
      showToast("已读取 " + file.name + " 并完成诊断");
    } catch (error) {
      showToast("文件读取失败，请改用粘贴文本", "error");
    }
  }

  function handleInput(event) {
    if (event.target.id === "resume-text") {
      const counter = $("#resume-char-count");
      if (counter) counter.textContent = String(event.target.value.length);
    }
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      if ($("#modal-root").innerHTML) closeModal();
      ui.agentOpen = false;
      ui.sidebarOpen = false;
      renderShell();
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      ui.agentOpen = true;
      renderShell();
      $("#agent-input").focus();
    }
  }

  function init() {
    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);
    document.addEventListener("change", handleFileChange);
    document.addEventListener("input", handleInput);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("beforeunload", saveState);
    render();
    if (window.CareerOS && window.CareerOS.llm) {
      window.CareerOS.llm.refreshServerStatus().then(() => renderModelStatus()).catch(() => renderModelStatus());
    }
    const hadStoredData = (() => {
      try {
        return Boolean(window.localStorage.getItem(STORAGE_KEY));
      } catch (_error) {
        return false;
      }
    })();
    if (!hadStoredData && !state.onboardingComplete) {
      window.setTimeout(() => openOnboardingModal(0), 500);
    } else if (!hadStoredData) {
      window.setTimeout(() => showToast("这是可交互示例。点击“调整画像”即可开始个性化。"), 800);
    }
  }

  window.CareerOS = Object.assign(window.CareerOS || {}, {
    state: state,
    ui: ui,
    getReadiness: getReadiness,
    generatePlan: generatePlan,
    scoreResume: scoreResume,
    render: render,
    version: "0.6.0",
  });

  init();
})();
