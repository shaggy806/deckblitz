import { defineCard } from "../define.js";

// Ruling:
//   If multiple Words have been used prior to drawing a card, you choose which one to apply
//   (and use up) each time you draw a card.
const TEXT = "{1}: The next time you would draw a card this turn, you gain 5 life instead.";

export default defineCard({
  name: "Words of Worship",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "replacement-effect",
        duration: "end-of-turn",
        next: true,
        replacement: { event: "would-draw", who: "you", instead: { effect: { kind: "gain-life", amount: 5 }, text: "You gain 5 life instead." } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
