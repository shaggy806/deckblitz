import { defineCard } from "../define.js";

// Makes Bear → uses "Bear Token".
//
// Ruling:
//   If multiple Words have been used prior to drawing a card, you choose which one to apply
//   (and use up) each time you draw a card.
const TEXT = "{1}: The next time you would draw a card this turn, create a 2/2 green Bear creature token instead.";

export default defineCard({
  name: "Words of Wilding",
  manaCost: "{2}{G}",
  colors: ["G"],
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
        replacement: { event: "would-draw", who: "you", instead: { effect: { kind: "create-token", token: "Bear Token", count: 1 },
          text: "Create a 2/2 green Bear creature token instead." } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
