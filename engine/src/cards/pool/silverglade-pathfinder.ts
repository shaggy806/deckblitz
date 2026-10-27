import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 20891.
//
// Rulings:
//   [2004-10-04] Because the "search" requires you to find a card with certain characteristics,
//     you don't have to find the card if you don't want to.
const TEXT =
  "{1}{G}, {T}, Discard a card: Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Silverglade Pathfinder",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true, discard: { count: 1 } },
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
      text: TEXT,
    },
  ],
});
