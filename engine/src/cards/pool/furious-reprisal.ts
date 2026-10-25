import { defineCard } from "../define.js";

// EDHREC rank 27485. Two different targets (the ruling: not the same one
// twice), each dealt 2 damage.

export default defineCard({
  name: "Furious Reprisal",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Furious Reprisal deals 2 damage to each of two targets.",
  targets: ["any-target", { kind: "other", of: "any-target", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
});
