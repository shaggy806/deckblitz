import { defineCard } from "../define.js";

export default defineCard({
  name: "Reality Hemorrhage",
  manaCost: "{1}{R}",
  colors: [],
  types: ["instant"],
  text: "Devoid (This card has no color.)\nReality Hemorrhage deals 2 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
});
