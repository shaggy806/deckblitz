import { defineCard } from "../define.js";

export default defineCard({
  name: "Tarfire",
  manaCost: "{R}",
  colors: ["R"],
  types: ["kindred", "instant"],
  subtypes: ["Goblin"],
  text: "Tarfire deals 2 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
});
