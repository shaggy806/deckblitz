import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 27185.
//
// Rulings:
//   Because the "search" requires you to find a card with certain characteristics, you don't
//     have to find the card if you don't want to.

const SEARCH =
  "{4}, {T}: Search your library for a Mercenary permanent card with mana value 4 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Cateran Enforcer",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror", "Mercenary"],
  power: 4,
  toughness: 3,
  keywords: ["fear"],
  text: `Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\n${SEARCH}`,
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Mercenary",
          manaValue: { op: "lte", n: 4 },
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
