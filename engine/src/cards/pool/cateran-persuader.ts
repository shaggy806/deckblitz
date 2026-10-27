import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 29322. Rathi Assassin's search at
// mana value 1.
//
// Rulings:
//   Because the "search" requires you to find a card with certain characteristics, you don't
//   have to find the card if you don't want to.

const TEXT =
  "{1}, {T}: Search your library for a Mercenary permanent card with mana value 1 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Cateran Persuader",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Mercenary",
          manaValue: { op: "lte", n: 1 },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
