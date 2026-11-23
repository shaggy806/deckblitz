import { defineCard } from "../define.js";

export default defineCard({
  name: "Omenpath to Naya",
  colors: [],
  types: ["land"],
  subtypes: ["Omenpath"],
  text: "Vanishing 4 (This land enters the battlefield with four time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\n{T}: Add {R}, {G}, or {W}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["R", "G", "W"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {R}, {G}, or {W}.",
    },
  ],
  triggered: [
    {
      keywordOf: "vanishing",
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "time", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, if this permanent has a time counter on it, remove a time counter from it.",
    },
    {
      keywordOf: "vanishing",
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
      keywordOf: "vanishing",
      replacement: { event: "enters-battlefield", counters: { kind: "time", amount: 4 } },
      text: "Vanishing 4 (This permanent enters with 4 time counters on it.)",
    },
  ],
});
