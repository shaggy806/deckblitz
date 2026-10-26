import { defineCard } from "../define.js";

// Urza's Legacy (ULG). EDHREC rank 8299. Storm World's shape, the other way
// round: "that player" is the opponent whose upkeep it is, and "minus 4"
// never goes below 0 (rule 107.1b).

const TEXT =
  "At the beginning of each opponent's upkeep, this artifact deals X damage to that player, where X is the number of cards in their hand minus 4.";

export default defineCard({
  name: "Iron Maiden",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "damage",
        who: "active-player",
        amount: { difference: [{ cardsInHand: "active-player" }, 4] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
