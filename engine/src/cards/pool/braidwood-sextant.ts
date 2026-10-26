import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 25052. Horizon Spellbomb's shape.
//
// Rulings:
//   [2004-10-04] Because the “search” requires you to find a card with certain characteristics,
//     you don’t have to find the card if you don’t want to.

export default defineCard({
  name: "Braidwood Sextant",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}, Sacrifice this artifact: Search your library for a basic land card, reveal that card, put it into your hand, then shuffle.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice this artifact: Search your library for a basic land card, reveal that card, put it into your hand, then shuffle.",
    },
  ],
});
