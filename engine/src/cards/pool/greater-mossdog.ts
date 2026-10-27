import { defineCard } from "../define.js";

// EDHREC rank 19860.
//
// Rulings:
//   [2024-01-12] If you're drawing multiple cards, each draw is performed one at a time. For
//     example, if you're instructed to draw two cards and you replace the first draw with a dredge
//     ability, another card with a dredge ability (including one that was milled by the first
//     dredge ability) may be used to replace the second draw.
//   [2024-01-12] Dredge can replace any card draw, not only the one during your draw step.
//   [2024-01-12] You can't attempt to use a dredge ability if you don't have enough cards in your
//     library.
//   [2024-01-12] One card draw can't be replaced by multiple dredge abilities.

export default defineCard({
  name: "Greater Mossdog",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Dog"],
  power: 3,
  toughness: 3,
  dredge: 3,
  text: "Dredge 3 (If you would draw a card, you may mill three cards instead. If you do, return this card from your graveyard to your hand.)",
});
