import { defineCard } from "../define.js";

export default defineCard({
  name: "Arc Trail",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Arc Trail deals 2 damage to any target and 1 damage to any other target.",
  targets: ["any-target", { kind: "other", of: "any-target", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage", amount: 1, target: 1 },
    ],
  },
});
