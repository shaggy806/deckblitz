import { defineCard } from "../define.js";

// EDHREC rank 16792.

const LOOT_TEXT = "{2}, Return a land you control to its owner's hand: Draw a card, then discard a card.";

export default defineCard({
  name: "Soratami Cloudskater",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${LOOT_TEXT}`,
  activated: [
    {
      // Soramaro's land-return cost, Arni's loot.
      cost: { mana: "{2}", tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
