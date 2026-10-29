import { defineCard } from "../define.js";

// Limited Edition Alpha. Iron Maiden's shape, aimed at one opponent chosen as
// it enters (rule 614.1c): "that player" is the chosen player, whose upkeep it
// is, and "minus 4" never goes below 0 (rule 107.1b).

const CHOOSE = "As this artifact enters, choose an opponent.";
const VISE =
  "At the beginning of the chosen player's upkeep, this artifact deals X damage to that player, where X is the number of cards in their hand minus 4.";

export default defineCard({
  name: "Black Vise",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${CHOOSE}\n${VISE}`,
  choosePlayerOnEnter: "opponent",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "chosen-player" },
      targets: [],
      effect: {
        kind: "damage",
        who: "chosen-player",
        amount: { difference: [{ cardsInHand: "chosen-player" }, 4] },
      },
      resolve: null,
      text: VISE,
    },
  ],
});
