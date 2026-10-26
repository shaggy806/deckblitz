import { defineCard } from "../define.js";

// EDHREC rank 19332.

const TEXT = "{2}, Return a land you control to its owner's hand: Target player mills two cards.";

export default defineCard({
  name: "Soratami Mindsweeper",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Moonfolk", "Wizard"],
  power: 1,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, returnToHand: { count: 1, filter: { type: "land" } } },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
