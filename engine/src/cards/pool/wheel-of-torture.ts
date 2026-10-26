import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] The number of cards is counted during resolution.

const TEXT =
  "At the beginning of each opponent's upkeep, this artifact deals X damage to that player, where X is 3 minus the number of cards in their hand.";

export default defineCard({
  name: "Wheel of Torture",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: { kind: "damage", amount: { difference: [3, { cardsInHand: "active-player" }] }, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
