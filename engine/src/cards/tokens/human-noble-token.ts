import { defineCard } from "../define.js";

// The Girl in the Fireplace's Human Noble token.

export default defineCard({
  name: "Human Noble Token",
  art: "1207efdc-c416-4918-80d9-8b18905eaa90",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 1,
  toughness: 1,
  text: "Vanishing 3\nPrevent all damage that would be dealt to this creature.",
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
      replacement: { event: "enters-battlefield", counters: { kind: "time", amount: 3 } },
      text: "Vanishing 3 (This permanent enters with 3 time counters on it.)",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self" },
      text: "Prevent all damage that would be dealt to this creature.",
    },
  ],
});
