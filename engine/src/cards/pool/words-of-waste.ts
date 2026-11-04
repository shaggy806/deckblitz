import { defineCard } from "../define.js";

// Ruling:
//   If multiple Words have been used prior to drawing a card, you choose which one to apply
//   (and use up) each time you draw a card.
const TEXT = "{1}: The next time you would draw a card this turn, each opponent discards a card instead.";

export default defineCard({
  name: "Words of Waste",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        nextDrawInstead: {
          effect: { kind: "discard", target: "each-opponent", amount: 1 },
          text: "Each opponent discards a card instead.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
