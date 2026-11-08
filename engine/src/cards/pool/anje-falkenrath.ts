import { defineCard } from "../define.js";

// EDHREC rank 8798.
//
// Rulings:
//   [2019-08-23] If you discard a card with madness to pay the cost of Anje’s activated ability,
//     you’ll draw a card last. You may untap Anje before or after you choose whether to cast the
//     discarded card, but not after you’ve chosen to cast it but before that spell resolves.

export default defineCard({
  name: "Anje Falkenrath",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\n{T}, Discard a card: Draw a card.\nWhenever you discard a card, if it has madness, untap Anje Falkenrath.",
  triggered: [
    {
      trigger: { on: "discards", who: "you", filter: { hasKeyword: "madness" } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever you discard a card, if it has madness, untap Anje Falkenrath.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Discard a card: Draw a card.",
    },
  ],
});
