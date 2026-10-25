import { defineCard } from "../define.js";

// EDHREC rank 25858.
//
// Rulings:
//   [2015-02-25] You may choose to discard a creature card and another card if you want to.

export default defineCard({
  name: "Mystic Meditation",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Draw three cards. Then discard two cards unless you discard a creature card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "discard", target: "you", amount: 2, unlessOne: { type: "creature" } },
    ],
  },
});
