import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). The creature is the damage's source (Inner
// Struggle's shape).
export default defineCard({
  name: "Kiku's Shadow",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target creature deals damage to itself equal to its power.",
  targets: ["creature"],
  effect: { kind: "damage", amount: { powerOf: 0 }, target: 0, from: { target: 0 } },
});
