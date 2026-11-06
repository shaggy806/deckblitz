import { defineCard } from "../define.js";

// EDHREC rank 32391.

export default defineCard({
  name: "Direct Hit",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Direct Hit deals 5 damage to target creature.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
});
