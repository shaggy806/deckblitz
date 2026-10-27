import { defineCard } from "../define.js";

export default defineCard({
  name: "Swelter",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Swelter deals 2 damage to each of two target creatures.",
  targets: ["creature", { kind: "other", of: "creature", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage", amount: 2, target: 1 },
    ],
  },
});
