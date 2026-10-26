import { defineCard } from "../define.js";

// EDHREC rank 24526.
//
// Rulings:
//   [2005-08-01] Imaginary Pet's ability triggers only if you have cards in your hand as your
//     upkeep begins, and the ability checks again as it resolves. If your hand is empty at both
//     those times, Imaginary Pet stays on the battlefield.
//
// "If you have a card in hand" is an intervening-if (rule 603.4): asked as the
// upkeep begins and again on resolution.

const TEXT = "At the beginning of your upkeep, if you have a card in hand, return this creature to its owner's hand.";

export default defineCard({
  name: "Imaginary Pet",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "hand-size", atLeast: 1 },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
