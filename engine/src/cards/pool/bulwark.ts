import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 26406.
//
// Rulings:
//   Counts cards during resolution.
//
// X is read as the trigger resolves; a negative difference is 0 (rule
// 107.1b). `cardsInHand: "each"` is the targeted player's hand (Sudden
// Impact's shape).

const TEXT =
  "At the beginning of your upkeep, this enchantment deals X damage to target opponent, where X is the number of cards in your hand minus the number of cards in that player's hand.";

export default defineCard({
  name: "Bulwark",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "damage",
        target: 0,
        amount: { difference: [{ cardsInHand: "you" }, { cardsInHand: "each" }] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
