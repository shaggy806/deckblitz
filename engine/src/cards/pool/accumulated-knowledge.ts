import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 25343.
//
// Rulings:
//   [2018-03-16] Because Accumulated Knowledge is still on the stack as you perform its
//     instructions, it isn't in your graveyard and won't add to the number of cards drawn.
//
// Frantic Inventory's shape over every graveyard (no `ownedBy`).

export default defineCard({
  name: "Accumulated Knowledge",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw a card, then draw cards equal to the number of cards named Accumulated Knowledge in all graveyards.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "draw", amount: { countInGraveyard: { name: "Accumulated Knowledge" } } },
    ],
  },
});
