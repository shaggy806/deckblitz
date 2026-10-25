import { defineCard } from "../define.js";

// EDHREC rank 30754. Two different targets, both required (its ruling).

export default defineCard({
  name: "Pinnacle of Rage",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Pinnacle of Rage deals 3 damage to each of two targets.",
  targets: ["any-target", { kind: "other", of: "any-target", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "damage", amount: 3, target: 1 },
    ],
  },
});
