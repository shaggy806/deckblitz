import { defineCard } from "../define.js";

// EDHREC rank 15114.
//
// Rulings:
//   [2012-05-01] If you have no cards in hand when Dangerous Wager resolves, you’ll simply draw
//     two cards.

export default defineCard({
  name: "Dangerous Wager",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Discard your hand, then draw two cards.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-hand", who: "you" },
      { kind: "draw", amount: 2 },
    ],
  },
});
