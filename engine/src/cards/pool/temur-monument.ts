import { defineCard } from "../define.js";

// EDHREC rank 19580.
// Makes Elephant → "5/5 Elephant Token" (a 5/5 green Elephant).

const SEARCH_TEXT =
  "When this artifact enters, search your library for a basic Forest, Island, or Mountain card, reveal it, put it into your hand, then shuffle.";
const SAC_TEXT =
  "{3}{G}{U}{R}, {T}, Sacrifice this artifact: Create a 5/5 green Elephant creature token. Activate only as a sorcery.";

export default defineCard({
  name: "Temur Monument",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${SEARCH_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", subtypes: ["Forest", "Island", "Mountain"] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}{U}{R}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "5/5 Elephant Token", count: 1 },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
});
