import { defineCard } from "../define.js";

// EDHREC rank 11044. Armillary Sphere's search, without the {T}.

const SEARCH_TEXT =
  "{2}, Sacrifice this creature: Search your library for up to two basic land cards, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Wild-Field Scarecrow",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 1,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender\n${SEARCH_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        reveal: true,
        min: 0,
        max: 2,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
