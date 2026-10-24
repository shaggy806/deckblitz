import { defineCard } from "../define.js";

// EDHREC rank 21711.
const TEXT =
  "Converge — Radiant Flames deals X damage to each creature, where X is the number of colors of mana spent to cast this spell.";

export default defineCard({
  name: "Radiant Flames",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: { kind: "damage-all", filter: { type: "creature" }, amount: { colorsSpentOf: "source" } },
});
