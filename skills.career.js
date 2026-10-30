(function () {
  "use strict";

  window.CareerAgent.registry.register({
    manifest: {
      id: "career-positioning",
      name: "方向定位",
      version: "1.0.0",
      description: "结合用户背景、偏好与市场岗位，生成可解释的方向建议。",
      permissions: ["profile:read", "roles:read", "roles:write", "memory:write"],
      intents: ["career-direction", "role-selection", "job-fit"],
      timeoutMs: 30000,
    },

    match(message) {
      return /岗位|方向|定位|适合|职业|转行|求职目标|产品|数据|运营/.test(message);
    },

    async run(input, context) {
      const state = context.state;
      const profile = state.profile;
      const sortedRoles = state.roles.slice().sort((a, b) => b.fit - a.fit);
      const topRole = sortedRoles[0];
      const secondRole = sortedRoles[1];

      state.memory.push({
        type: "career-preference",
        content: input.message,
        createdAt: new Date().toISOString(),
      });

      return {
        text:
          "结合你的「" + profile.major + "」背景、" + profile.experienceLevel + " 经历、" +
          profile.weeklyHours + "h/周的可投入时间，我建议先把 " + topRole.title + " 作为主攻方向。\n\n" +
          "理由：它的匹配度目前最高（" + topRole.fit + "%），且你已有的项目经历可以迁移；" +
          secondRole.title + " 可作为第二方向，但需要补一段能量化的数据证据。\n\n" +
          "接下来不要同时铺开四条线。先完成一次岗位样本研究，再用同一版简历投 3 个相似岗位测试反馈。",
        suggestions: ["帮我锁定主攻岗位", "分析我的能力缺口", "生成 7 天验证计划"],
        actions: [
          { label: "查看定位工作台", view: "positioning" },
          { label: "锁定目标岗位", view: "positioning" },
        ],
        memoryWrite: true,
      };
    },
  });
})();
