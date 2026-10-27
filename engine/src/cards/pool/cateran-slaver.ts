import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 27811.
//
// Rulings:
//   Because the "search" requires you to find a card with certain characteristics, you don't
//     have to find the card if you don't want to.

const SEARCH =
  "{5}, {T}: Search your library for a Mercenary permanent card with mana value 5 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Cateran Slaver",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror", "Mercenary"],
  power: 5,
  toughness: 5,
  keywords: ["swampwalk"],
  text: `Swampwalk (This creature can't be blocked as long as defending player controls a Swamp.)\n${SEARCH}`,
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Mercenary",
          manaValue: { op: "lte", n: 5 },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH,
    },
  ],
});
