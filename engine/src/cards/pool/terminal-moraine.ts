import { defineCard } from "../define.js";

// EDHREC rank 11732.
//
// Rulings:
//   [2004-10-04] Because the "search" requires you to find a card with certain characteristics,
//     you don't have to find the card if you don't want to.

export default defineCard({
  name: "Terminal Moraine",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{2}, {T}, Sacrifice this land: Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", supertype: "basic" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: "{2}, {T}, Sacrifice this land: Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
    },
  ],
});
