import { defineCard } from "../define.js";

// EDHREC rank 10163.
//
// Winternight Stories' text word for word: Thirst for Discovery's "unless you
// discard a … card" shape.
const TEXT = "Draw three cards. Then discard two cards unless you discard a creature card.";

export default defineCard({
  name: "Thirst for Identity",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "discard", target: "you", amount: 2, unlessOne: { type: "creature" } },
    ],
  },
});
