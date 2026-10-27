import { defineCard } from "../define.js";

// EDHREC rank 23621.

const TEXT =
  "At the beginning of each opponent's upkeep, this creature deals X damage to that player, where X is 3 minus the number of cards in their hand.";

export default defineCard({
  name: "Rackling",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Construct"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "damage",
        amount: { difference: [3, { cardsInHand: "active-player" }] },
        who: "active-player",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
