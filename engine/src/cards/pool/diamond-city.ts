import { defineCard } from "../define.js";

// EDHREC rank 3154.

export default defineCard({
  name: "Diamond City",
  colors: [],
  types: ["land"],
  text: "This land enters with a shield counter on it. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)\n{T}: Add {C}.\n{T}: Move a shield counter from this land onto target creature. Activate only if two or more creatures entered the battlefield under your control this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "move-counters", from: "source", to: 0, counter: "shield" },
      resolve: null,
      text: "{T}: Move a shield counter from this land onto target creature. Activate only if two or more creatures entered the battlefield under your control this turn.",
      condition: { kind: "turn-history", what: "entered", filter: { type: "creature" }, atLeast: 2 },
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "shield", amount: 1 } },
      text: "This land enters with a shield counter on it.",
    },
  ],
});
