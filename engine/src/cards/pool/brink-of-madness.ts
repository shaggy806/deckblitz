import { defineCard } from "../define.js";

// Rulings:
//   The ability only triggers if you have no cards in your hand as your upkeep step begins.
//   You must sacrifice Brink of Madness if possible, but the opponent discards their hand even
//   if you can't sacrifice it for some reason.

const TEXT = "At the beginning of your upkeep, if you have no cards in hand, sacrifice this enchantment and target opponent discards their hand.";

export default defineCard({
  name: "Brink of Madness",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "hand-size", atMost: 0 },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice-source" },
          { kind: "discard", target: 0, amount: { cardsInHand: "each" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
