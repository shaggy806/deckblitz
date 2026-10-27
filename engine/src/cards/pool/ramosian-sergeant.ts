import { defineCard } from "../define.js";

// EDHREC rank 22882.
//
// Rulings:
//   [2004-10-04] Because the "search" requires you to find a card with certain characteristics,
//     you don't have to find the card if you don't want to.

const SEARCH_TEXT =
  "{3}, {T}: Search your library for a Rebel permanent card with mana value 2 or less, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Ramosian Sergeant",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 1,
  toughness: 1,
  text: SEARCH_TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: {
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          subtype: "Rebel",
          manaValue: { op: "lte", n: 2 },
        },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
