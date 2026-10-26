import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 15791. The hand is counted as this resolves
// (the ruling).

const TEXT =
  "At the beginning of each player's upkeep, return to its owner's hand each creature that player controls with power greater than the number of cards in their hand.";

export default defineCard({
  name: "Noetic Scales",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "return-to-hand-all",
        filter: {
          type: "creature",
          controlledBy: "active-player",
          power: { op: "gt", n: { amount: { cardsInHand: "active-player" } } },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
