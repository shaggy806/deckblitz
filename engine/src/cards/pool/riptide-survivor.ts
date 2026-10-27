import { defineCard } from "../define.js";

// EDHREC rank 22914.
//
// Rulings:
//   [2004-10-04] If you have less than 2 cards in your hand, discard all the cards you have. If
//     you have no cards in hand, you can discard zero and draw 3.

export default defineCard({
  name: "Riptide Survivor",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  morph: { keyword: "morph", cost: "{1}{U}{U}" },
  text: "Morph {1}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, discard two cards, then draw three cards.",
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 2 },
          { kind: "draw", amount: 3 },
        ],
      },
      resolve: null,
      text: "When this creature is turned face up, discard two cards, then draw three cards.",
    },
  ],
});
