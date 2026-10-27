import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 18256.
//
// Rulings:
//   [2004-10-04] Because the "search" requires you to find a card with certain characteristics,
//     you don't have to find the card if you don't want to.
export default defineCard({
  name: "Cateran Summons",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Search your library for a Mercenary card, reveal that card, put it into your hand, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { subtype: "Mercenary" },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
});
