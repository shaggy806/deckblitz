import { defineCard } from "../define.js";

// EDHREC rank 18464.
//
// Rulings:
//   [2020-09-25] If the target opponent can discard only one card or can't discard any cards,
//     they still mill a card and lose 1 life, and you gain 1 life.

export default defineCard({
  name: "Mind Drain",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent discards two cards, mills a card, and loses 1 life. You gain 1 life. (To mill a card, a player puts the top card of their library into their graveyard.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      { kind: "mill", target: 0, amount: 1 },
      { kind: "lose-life", target: 0, amount: 1 },
      { kind: "gain-life", amount: 1 },
    ],
  },
});
