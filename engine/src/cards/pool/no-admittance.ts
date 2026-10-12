import { defineCard } from "../define.js";

export default defineCard({
  name: "No Admittance",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "No Admittance deals 3 damage to any target.\nEmpower Jace 1. (Put a loyalty counter on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 3, target: 0 }, { kind: "empower-jace", amount: 1 }],
  },
});
