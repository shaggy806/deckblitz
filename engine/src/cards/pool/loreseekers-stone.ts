import { defineCard } from "../define.js";

// EDHREC rank 17366.
//
// Rulings:
//   [2020-11-10] Use the number of cards in your hand at the time you activate the ability (before
//     drawing three cards) to determine how much mana to add to the activation cost.

// The ability's own `costIncrease`, the cards in hand read as the cost is
// totalled (rules 601.2f, 602.2b).
const TEXT = "{3}, {T}: Draw three cards. This ability costs {1} more to activate for each card in your hand.";

export default defineCard({
  name: "Loreseeker's Stone",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      costIncrease: { increaseGeneric: { cardsInHand: "you" } },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
