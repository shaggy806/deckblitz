import { defineCard } from "../define.js";

// EDHREC rank 23584.
//
// Rulings:
//   [2012-05-01] Discarding a card is part of the ability’s activation cost. You can’t activate
//     the ability if you have no cards in hand.

export default defineCard({
  name: "Mad Prophet",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\n{T}, Discard a card: Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Discard a card: Draw a card.",
    },
  ],
});
