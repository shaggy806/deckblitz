import { defineCard } from "../define.js";

export default defineCard({
  name: "Gin'tak Charge",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gin'tak Charge deals 2 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
});
