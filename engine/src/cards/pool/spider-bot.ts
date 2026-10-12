import { defineCard } from "../define.js";

// EDHREC rank 8461.

// Fountainport Bell's search.
const SEARCH_TEXT =
  "When this creature enters, you may search your library for a basic land card, reveal it, then shuffle and put that card on top.";

export default defineCard({
  name: "Spider-Bot",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Spider", "Robot", "Scout"],
  power: 2,
  toughness: 1,
  keywords: ["reach"],
  text: `Reach\n${SEARCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "library-top",
          reveal: true,
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
