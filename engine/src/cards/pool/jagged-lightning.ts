import { defineCard } from "../define.js";

// EDHREC rank 29764.

export default defineCard({
  name: "Jagged Lightning",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Jagged Lightning deals 3 damage to each of two target creatures.",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "damage", amount: 3, target: 1 },
    ],
  },
});
