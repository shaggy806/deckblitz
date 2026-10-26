import { defineCard } from "../define.js";

// Urza's Saga. EDHREC rank 26704.
//
// Rulings:
//   [2004-10-04] If the player has no cards in hand, this has no effect.
//
// "Its controller" is the dying creature's controller — the trigger object's.

const TEXT = "Whenever a green creature dies, its controller discards a card.";

export default defineCard({
  name: "Bereavement",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", colors: ["G"] } },
      targets: [],
      effect: { kind: "discard", target: "trigger-controller", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
