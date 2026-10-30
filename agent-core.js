(function () {
  "use strict";

  class EventBus {
    constructor() {
      this.listeners = new Map();
    }

    on(type, listener) {
      if (!this.listeners.has(type)) this.listeners.set(type, new Set());
      this.listeners.get(type).add(listener);
      return () => this.listeners.get(type).delete(listener);
    }

    emit(type, payload) {
      const listeners = this.listeners.get(type);
      if (!listeners) return;
      listeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (error) {
          console.error("[CareerAgent event error]", type, error);
        }
      });
    }
  }

  class SkillRegistry {
    constructor() {
      this.skills = new Map();
    }

    register(skill) {
      this.validate(skill);
      if (this.skills.has(skill.manifest.id)) {
        throw new Error("Skill already registered: " + skill.manifest.id);
      }
      this.skills.set(skill.manifest.id, Object.freeze(skill));
      return skill.manifest.id;
    }

    validate(skill) {
      if (!skill || !skill.manifest || !skill.manifest.id) {
        throw new Error("A skill must declare manifest.id");
      }
      if (typeof skill.match !== "function" || typeof skill.run !== "function") {
        throw new Error("Skill must implement match() and run()");
      }
      if (!Array.isArray(skill.manifest.permissions)) {
        throw new Error("Skill must declare manifest.permissions");
      }
    }

    get(id) {
      return this.skills.get(id);
    }

    list() {
      return Array.from(this.skills.values()).map((skill) => ({ ...skill.manifest }));
    }

    match(message, state) {
      return (
        Array.from(this.skills.values()).find((skill) => {
          try {
            return skill.match(message.trim(), state);
          } catch (error) {
            console.error("[CareerAgent skill match error]", skill.manifest.id, error);
            return false;
          }
        }) || null
      );
    }
  }

  class AgentOrchestrator {
    constructor(options) {
      this.registry = options.registry;
      this.eventBus = options.eventBus;
      this.fallbackSkill = options.fallbackSkill;
    }

    async handle(message, context) {
      const input = String(message || "").trim();
      if (!input) throw new Error("Message cannot be empty");

      const skill = this.registry.match(input, context.state) || this.fallbackSkill;
      const startedAt = performance.now();
      this.eventBus.emit("agent.turn.started", {
        message: input,
        skillId: skill.manifest.id,
        context: context,
      });

      try {
        const result = await skill.run({ message: input }, context);
        this.eventBus.emit("agent.skill.completed", {
          skillId: skill.manifest.id,
          durationMs: Math.round(performance.now() - startedAt),
          result: result,
        });
        return Object.assign({}, result, { skillId: skill.manifest.id });
      } catch (error) {
        this.eventBus.emit("agent.skill.failed", {
          skillId: skill.manifest.id,
          error: error,
        });
        return {
          skillId: skill.manifest.id,
          text: "这一步暂时没有跑通。你的数据仍然保留，可以稍后再试或换一种描述。",
          error: error.message,
        };
      }
    }
  }

  const eventBus = new EventBus();
  const registry = new SkillRegistry();
  const fallbackSkill = {
    manifest: {
      id: "career-conversation",
      name: "求职对话",
      version: "1.0.0",
      description: "承接未被专用 Skill 命中的求职对话。",
      permissions: ["profile:read", "plan:read"],
    },
    match: () => true,
    run: async function (_input, context) {
      const profile = context.state.profile;
      const openTask = context.state.tasks.find((task) => !task.done);
      return {
        text:
          profile.name +
          "，我已经把这条信息放进当前求职上下文。基于你现在的主线，建议先完成「" +
          (openTask ? openTask.title : "本周复盘") +
          "」，再决定是否调整方向。\n\n" +
          "如果你愿意，可以补充：目标城市、硬性截止时间，以及这次最担心的环节。",
        suggestions: ["帮我拆解下一步", "查看本周行动计划", "重新评估目标岗位"],
        actions: [
          { label: "查看行动计划", view: "plan" },
          { label: "补充个人画像", action: "open-profile" },
        ],
      };
    },
  };

  window.CareerAgent = {
    registry: registry,
    eventBus: eventBus,
    orchestrator: new AgentOrchestrator({ registry: registry, eventBus: eventBus, fallbackSkill: fallbackSkill }),
    fallbackSkill: fallbackSkill,
  };
})();
