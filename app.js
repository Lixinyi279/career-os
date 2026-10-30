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

  const VIEW_META = {
    dashboard: { root: "工作台", current: "今日推进" },
    positioning: { root: "方向定位", current: "目标与证据" },
    resume: { root: "简历工坊", current: "诊断与改写" },
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
      version: 1,
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
      roles: [
        { id: "product-ops", title: "产品运营", track: "互联网 / SaaS", fit: 84, salary: "14-22K", status: "主攻", selected: true, why: "项目经历与用户研究能力可直接迁移，岗位样本多，适合作为秋招主线。", gaps: ["指标体系", "A/B 实验"] },
        { id: "data-product", title: "数据产品", track: "企业服务 / 消费科技", fit: 79, salary: "16-24K", status: "第二方向", selected: false, why: "信息管理背景与 SQL 能力匹配，但需要补一个完整的数据产品案例。", gaps: ["需求抽象", "数据建模"] },
        { id: "user-research", title: "用户研究", track: "互联网 / 咨询", fit: 73, salary: "13-20K", status: "观察", selected: false, why: "访谈和洞察是优势，但岗位数量更少，对方法论深度要求更高。", gaps: ["研究方法", "样本设计"] },
        { id: "ai-product", title: "AI 产品运营", track: "AI 应用 / 工具", fit: 68, salary: "15-23K", status: "探索", selected: false, why: "增长快且与内容运营相通，但需要补充 AI 产品理解与评测经验。", gaps: ["AI 产品认知", "提示词评测"] },
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
    state.messages = Array.isArray(saved.messages) ? saved.messages : fresh.messages;
    state.memory = Array.isArray(saved.memory) ? saved.memory : fresh.memory;
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
    const positioning = Math.min(92, Math.round(38 + completeness * 0.42 + (selectedRole ? 8 : 0)));
    const resume = Math.max(20, Math.min(94, state.resume.score || 34));
    const interview = Math.max(18, Math.min(92, state.interview.score || 28));
    const pipeline = Math.max(16, Math.min(90, 18 + Math.round(taskCompletion() * 0.72)));
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
    $("#agent-context-title").textContent = state.profile.gradYear + " 届 · " + state.profile.targetTrack;
    $("#agent-context-completeness").textContent = "画像 " + readiness.completeness + "%";
    $("#agent-context-hours").textContent = "本周 " + state.profile.weeklyHours + "h";
    $("#agent-context-cities").textContent = state.profile.cities;
    const meta = VIEW_META[ui.view] || VIEW_META.dashboard;
    $("#breadcrumb-root").textContent = meta.root;
    $("#breadcrumb-current").textContent = meta.current;

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
      '<section class="card insight-card">' +
      '<div class="insight-mark">' + icon("quote", 22) + '</div>' +
      '<div><span class="section-kicker">Agent 观察</span><h3>你的问题不是经历少，而是证据没有被翻译成岗位语言。</h3><p>信息管理背景、用户访谈和项目推动能力都能迁移到产品运营。下一次改写时，把“做了什么”换成“在什么约束下做了哪个决策，带来了什么变化”。</p><button class="button button-secondary" data-prompt="帮我分析能力缺口并给一个改写例子">继续分析能力缺口</button></div>' +
      '</section>'
    );

    html.push('</div></div>');
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
      '<div class="card-heading"><div><span class="section-kicker">可迁移优势</span><h3>你已经有什么</h3></div><span class="tag tag-green">3 类证据</span></div>' +
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
      '<button class="button button-secondary" data-action="reset-data">' + icon("trash-2", 15) + '重置演示数据</button><button class="button button-primary" type="submit" form="profile-page-form">' + icon("check", 16) + '保存档案</button>'
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

  function openLlmSettingsModal() {
    const cfg = window.CareerOS.llm.getConfig();
    const presetOptions = Object.keys(window.CareerOS.llm.presets).map((key) => {
      const p = window.CareerOS.llm.presets[key];
      return '<option value="' + key + '">' + escapeHTML(p.label) + '</option>';
    }).join("");
    const content =
      '<form id="llm-form" class="modal-form">' +
      '<label class="field"><span>模型服务</span><select name="preset" id="llm-preset">' + presetOptions + '</select></label>' +
      '<label class="field"><span>API Key</span><input name="apiKey" type="password" value="' + escapeHTML(cfg.apiKey || "") + '" placeholder="sk-..." autocomplete="off" /></label>' +
      '<label class="field"><span>接口地址 baseUrl</span><input name="baseUrl" id="llm-baseurl" value="' + escapeHTML(cfg.baseUrl || "") + '" placeholder="https://api.deepseek.com/v1" /></label>' +
      '<label class="field"><span>模型名 model</span><input name="model" id="llm-model" value="' + escapeHTML(cfg.model || "") + '" placeholder="deepseek-chat" /></label>' +
      '<div class="modal-note">' + icon("info", 16) + '<span>Key 只存在本机浏览器，不会上传。不填则继续用规则演示模式。</span></div>' +
      '<div class="modal-actions"><button type="button" class="button button-secondary" data-action="close-modal">取消</button><button type="submit" class="button button-primary">保存并启用真 AI</button></div></form>';
    openModal(content, { title: "接入大模型", kicker: "真 AI 引擎", label: "接入大模型" });
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
    showToast("演示数据已重置");
  }

  function handleClick(event) {
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
      } else if (action === "open-profile") {
        openProfileModal();
      } else if (action === "show-skills") {
        openSkillsModal();
      } else if (action === "open-llm-settings") {
        openLlmSettingsModal();
      } else if (action === "close-modal") {
        closeModal();
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

  function handleSubmit(event) {
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
      closeModal();
      const ok = window.CareerOS.llm.createLlmAdapter().configured();
      showToast(ok ? "真 AI 已启用" : "已保存，但信息不完整，仍为演示模式");
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
    const hadStoredData = (() => {
      try {
        return Boolean(window.localStorage.getItem(STORAGE_KEY));
      } catch (_error) {
        return false;
      }
    })();
    if (!hadStoredData) {
      window.setTimeout(() => showToast("这是可交互示例。点击“调整画像”即可开始个人化。"), 800);
    }
  }

  window.CareerOS = {
    state: state,
    ui: ui,
    getReadiness: getReadiness,
    generatePlan: generatePlan,
    scoreResume: scoreResume,
    render: render,
    version: "0.1.0",
  };

  init();
})();
