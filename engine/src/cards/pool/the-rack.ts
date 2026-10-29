import { defineCard } from "../define.js";

// Antiquities. Black Vise turned round: "3 minus the number of cards in their
// hand" never goes below 0 (rule 107.1b).

const CHOOSE = "As this artifact enters, choose an opponent.";
const RACK =
  "At the beginning of the chosen player's upkeep, this artifact deals X damage to that player, where X is 3 minus the number of cards in their hand.";

export default defineCard({
  name: "The Rack",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${CHOOSE}\n${RACK}`,
  choosePlayerOnEnter: "opponent",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "chosen-player" },
      targets: [],
      effect: {
        kind: "damage",
        who: "chosen-player",
        amount: { difference: [3, { cardsInHand: "chosen-player" }] },
      },
      resolve: null,
      text: RACK,
    },
  ],
});
