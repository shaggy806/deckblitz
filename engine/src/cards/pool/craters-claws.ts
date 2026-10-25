import { defineCard } from "../define.js";

// EDHREC rank 16305. Ferocious "instead": X plus 2 replaces X, read as the
// spell resolves (X = 0 deals 2 — the ruling).

export default defineCard({
  name: "Crater's Claws",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text:
    "Crater's Claws deals X damage to any target.\n" +
    "Ferocious — Crater's Claws deals X plus 2 damage instead if you control a creature with power 4 or greater.",
  targets: ["any-target"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      ifCondition: {
        kind: "controls",
        filter: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } },
        atLeast: 1,
      },
      then: { sum: ["x", 2] },
      else: "x",
    },
  },
});
