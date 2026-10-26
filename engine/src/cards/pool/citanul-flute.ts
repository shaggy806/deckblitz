import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 14770.
//
// X can be 0, and finding nothing is allowed (the rulings): `min: 0`.

const TEXT =
  "{X}, {T}: Search your library for a creature card with mana value X or less, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Citanul Flute",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "creature", manaValue: { op: "lte", n: "x" } },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
