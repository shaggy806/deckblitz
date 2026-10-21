import { defineCard } from "../define.js";

// EDHREC rank 26543. A world enchantment (704.5k). X is never below 0
// (rule 107.1b): a player with four or more cards in hand takes none.

const TEXT =
  "At the beginning of each player's upkeep, this enchantment deals X damage to that player, where X is 4 minus the number of cards in their hand.";

export default defineCard({
  name: "Storm World",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "damage", amount: { difference: [4, { cardsInHand: "active-player" }] }, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
