(function () {
  "use strict";

  window.CareerAgent.registry.register({
    manifest: {
      id: "mock-interview",
      name: "模拟面试",
      version: "1.0.0",
      description: "提供行为面、业务面与压力面训练，并基于回答生成反馈。",
      permissions: ["profile:read", "interview:read", "interview:write"],
      intents: ["mock-interview", "stress-test", "interview-feedback"],
      timeoutMs: 60000,
    },

    match(message) {
      return /面试|压力|追问|群面|行为面|业务面|自我介绍|挂掉/.test(message);
    },

    async run(input, context) {
      const isStress = /压力|追问|质疑|打断/.test(input.message);
      const mode = isStress ? "stress" : "behavior";
      context.state.interview.mode = mode;
      context.state.interview.intensity = isStress ? "high" : "standard";

      return {
        text: isStress
          ? "可以，我们直接进压力模式。我会压缩你的回答空间、追问证据，并对空泛表述继续施压。目标不是让你舒服，而是让真实问题提前暴露。\n\n准备好后点击开始，每轮回答控制在 90 秒以内。"
          : "先用行为面试校准你的表达结构。我会优先追问项目里的个人贡献、权衡过程和结果证据，而不是只考察标准答案。\n\n选好模式后开始即可。",
        suggestions: ["开始压力测试", "先练习自我介绍", "复盘上次回答"],
        actions: [{ label: "进入模拟面试", view: "interview" }],
        preset: { mode: mode, intensity: isStress ? "high" : "standard" },
      };
    },
  });
})();
