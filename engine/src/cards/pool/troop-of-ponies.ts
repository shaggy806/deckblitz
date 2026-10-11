import { defineCard } from "../define.js";

// The Hobbit (HOB). EDHREC rank 5928. Kodama's Reach's search.
//
// Rulings:
//   [2026-06-29] If you choose to find only one basic land card, you put it onto the battlefield
//     tapped.

const TEXT =
  "{2}, {T}, Sacrifice this creature: Search your library for up to two basic land cards, reveal them, put one onto the battlefield tapped and the other into your hand, then shuffle.";

export default defineCard({
  name: "Troop of Ponies",
  manaCost: "{2}",
  colors: [],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        min: 0,
        max: 2,
        destination: "battlefield",
        enterTapped: true,
        restDestination: "hand",
        reveal: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
