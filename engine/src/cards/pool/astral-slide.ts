import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] If a player cycles a card during the end step, the creature that is exiled won't
//     come back until the end of the next turn.
//   [2008-08-01] If a face-down card is exiled, it turns face-up and remains face-up when it
//     returns to the battlefield. This does not trigger any abilities that would trigger on it
//     being turned face-up.

const TEXT =
  "Whenever a player cycles a card, you may exile target creature. If you do, return that card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Astral Slide",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cycles", who: "any" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Exile target creature? (It returns at the beginning of the next end step.)",
        effect: {
          kind: "flicker",
          target: 0,
          returnAt: "next-end-step",
          returnText: "Return the exiled card to the battlefield under its owner's control.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
