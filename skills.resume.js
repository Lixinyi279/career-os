(function () {
  "use strict";

  window.CareerAgent.registry.register({
    manifest: {
      id: "resume-review",
      name: "简历诊断",
      version: "1.0.0",
      description: "检查简历结构、成果表达与目标岗位相关性，输出可执行修改项。",
      permissions: ["profile:read", "resume:read", "resume:write"],
      intents: ["resume-review", "resume-rewrite", "jd-match"],
      timeoutMs: 45000,
    },

    match(message) {
      return /简历|履历|CV|JD|岗位描述|项目经历|STAR|投递材料/i.test(message);
    },

    async run(_input, context) {
      const resume = context.state.resume;
      const hasResume = resume.text && resume.text.trim().length >= 80;
      const score = hasResume ? resume.score : 0;
      const weakest = hasResume
        ? resume.dimensions.slice().sort((a, b) => a.value - b.value)[0]
        : null;

      return {
        text: hasResume
          ? "当前简历诊断分为 " + score + "/100。最明显的问题在「" + weakest.label + "」（" + weakest.value + "%）。\n\n" +
            "优先改 3 处：\n1. 每段项目经历补上结果指标，不只写负责什么；\n" +
            "2. 用目标 JD 中的业务词替换泛化描述；\n3. 把最有相关性的项目移到第一屏。\n\n" +
            "先改一版再诊断，不建议反复润色同一句话。"
          : "我还没有看到你的简历正文。先在简历工坊粘贴内容或上传文本文件，我再按目标岗位做一次结构化诊断。",
        suggestions: ["按 STAR 改写项目", "对比目标 JD", "生成 3 条修改任务"],
        actions: [{ label: "进入简历工坊", view: "resume" }],
      };
    },
  });
})();
