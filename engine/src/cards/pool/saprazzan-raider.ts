import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 32081.
//
// Rulings:
//   It returns as soon as it is blocked. It does not remain on the battlefield long enough to
//     deal damage.

const TEXT = "When this creature becomes blocked, return it to its owner's hand.";

export default defineCard({
  name: "Saprazzan Raider",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
