import { defineCard } from "../define.js";

// EDHREC rank 26426.
//
// A copy, or a free cast, spent no mana: it draws none, and still discards
// two (the rulings; the discard has no "if you do").

export default defineCard({
  name: "Brilliant Spectrum",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Converge — Draw X cards, where X is the number of colors of mana spent to cast this spell. Then discard two cards.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: { colorsSpentOf: "source" } },
      { kind: "discard", target: "you", amount: 2 },
    ],
  },
});
