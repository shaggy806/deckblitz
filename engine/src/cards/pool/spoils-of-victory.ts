import { defineCard } from "../define.js";

// EDHREC rank 14363.
//
// Rulings:
//   [2004-10-04] Because the “search” requires you to find a card with certain characteristics,
//     you don’t have to find the card if you don’t want to.
//   [2009-10-01] Spoils of Victory allows you to search your library for any card with the land
//     type Plains, Island, Swamp, Mountain, or Forest, not just a card with one of those names.

export default defineCard({
  name: "Spoils of Victory",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a Plains, Island, Swamp, Mountain, or Forest card and put that card onto the battlefield. Then shuffle.",
  effect: {
    kind: "search-library",
    filter: { type: "land", subtypes: ["Plains", "Island", "Swamp", "Mountain", "Forest"] },
    destination: "battlefield",
    min: 0,
    max: 1,
  },
});
