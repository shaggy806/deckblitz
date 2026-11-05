import { defineCard } from "../define.js";

// EDHREC rank 23515.

export default defineCard({
  name: "Flame Wave",
  manaCost: "{3}{R}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Flame Wave deals 4 damage to target player or planeswalker and each creature that player or that planeswalker's controller controls.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 4, target: 0 },
      { kind: "damage-all", filter: { type: "creature" }, amount: 4, controlledByTarget: 0 },
    ],
  },
});
