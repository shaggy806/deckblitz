import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 22703.

const TEXT =
  "At the beginning of each opponent's upkeep, that player loses X life, where X is the number of cards in that player's hand minus the number of cards in your hand.";

export default defineCard({
  name: "Dark Suspicions",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "lose-life",
        who: "active-player",
        amount: { difference: [{ cardsInHand: "active-player" }, { cardsInHand: "you" }] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
