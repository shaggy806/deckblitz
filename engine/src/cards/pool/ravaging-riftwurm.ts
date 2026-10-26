import { defineCard } from "../define.js";

const KICKED = "If this creature was kicked, it enters with three additional time counters on it.";

export default defineCard({
  name: "Ravaging Riftwurm",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 6,
  kicker: { cost: "{4}" },
  text: `Kicker {4} (You may pay an additional {4} as you cast this spell.)\nVanishing 2 (This creature enters with two time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\n${KICKED}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "time", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, if this permanent has a time counter on it, remove a time counter from it.",
    },
    {
      trigger: { on: "counters-removed", who: "self", counter: "time", last: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When the last time counter is removed from this permanent, sacrifice it.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "time", amount: 2 } },
      text: "Vanishing 2 (This permanent enters with 2 time counters on it.)",
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "time", amount: { ifCondition: { kind: "self-kicked" }, then: 3, else: 0 } },
      },
      text: KICKED,
    },
  ],
});
