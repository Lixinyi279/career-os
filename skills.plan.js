(function () {
  "use strict";

  window.CareerAgent.registry.register({
    manifest: {
      id: "plan-builder",
      name: "行动规划",
      version: "1.0.0",
      description: "把职业目标拆解成受时间、紧急度和证据缺口约束的周计划。",
      permissions: ["profile:read", "plan:read", "plan:write", "memory:read"],
      intents: ["weekly-plan", "task-prioritization", "progress-review"],
      timeoutMs: 30000,
    },

    match(message) {
      return /计划|安排|时间|本周|任务|截止|推进|复盘|优先级|忙/.test(message);
    },

    async run(_input, context) {
      const state = context.state;
      const plan = context.generatePlan(state.profile, state.tasks);
      state.tasks = plan.tasks;
      state.planVersion = (state.planVersion || 1) + 1;

      return {
        text:
          "已按你每周可投入 " + state.profile.weeklyHours + " 小时重排计划。这周只保留 " + plan.tasks.length + " 个关键动作，" +
          "其他事项暂时移出主线。\n\n" +
          "当前最高优先级是「" + plan.tasks[0].title + "」。它直接补齐 " + plan.focus + " 证据缺口，预计 " + plan.tasks[0].duration + " 分钟。\n\n" +
          "完成一项就勾掉一项；如果连续两天偏离计划，我会降低任务颗粒度。",
        suggestions: ["为什么这样排序", "把今天任务再拆小", "我只有 5 小时怎么办"],
        actions: [{ label: "查看新计划", view: "plan" }],
        planUpdated: true,
      };
    },
  });
})();
