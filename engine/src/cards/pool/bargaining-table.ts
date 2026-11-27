import { defineCard } from "../define.js";

// Mercadian Masques.
//
// Rulings:
//   [2004-10-04] You choose an opponent on announcement. This is not targeted, but a choice is
//     still made. This choice is made before determining the value for X that is used in the cost.
//
// `xIs: { cardsInHandOf: "an-opponent" }`: the opponent named as it's activated is X's only
// reader, so it's offered once per hand size an opponent has (rule 107.3c — X defined by its
// text, not chosen).

const TEXT = "{X}, {T}: Draw a card. X is the number of cards in an opponent's hand.";

export default defineCard({
  name: "Bargaining Table",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      xIs: { cardsInHandOf: "an-opponent" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
