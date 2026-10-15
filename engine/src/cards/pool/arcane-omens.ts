import { defineCard } from "../define.js";

// EDHREC rank 27539. Secrets of Strixhaven.
//
// X is the colours of mana spent to cast it: 0 for a copy or a free cast (the
// converge rulings).

export default defineCard({
  name: "Arcane Omens",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Converge — Target player discards X cards, where X is the number of colors of mana spent to cast this spell.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: { colorsSpentOf: "source" } },
});
