import { defineCard } from "../define.js";

// Converge counts the colours spent on whatever cost was paid — the flashback
// cost too; a free cast or a copy spent none (the rulings).
const TEXT =
  "Converge — Kaleidoscorch deals X damage to any target, where X is the number of colors of mana spent to cast this spell.";

export default defineCard({
  name: "Kaleidoscorch",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{4}{R}" },
  text: `${TEXT}\nFlashback {4}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: ["any-target"],
  effect: { kind: "damage", amount: { colorsSpentOf: "source" }, target: 0 },
});
