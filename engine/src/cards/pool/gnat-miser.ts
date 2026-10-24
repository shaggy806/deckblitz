import { defineCard } from "../define.js";

// EDHREC rank 7993.
//
// Rulings:
//   [2005-06-01] If multiple effects modify a player's hand size, apply them in timestamp order.
// `maxHandSize` effects apply in timestamp order (rule 613.11).

const TEXT = "Each opponent's maximum hand size is reduced by one.";

export default defineCard({
  name: "Gnat Miser",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      maxHandSize: { who: "opponents", adjust: -1 },
      text: TEXT,
    },
  ],
});
