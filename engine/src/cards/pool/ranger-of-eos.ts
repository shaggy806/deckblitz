import { defineCard } from "../define.js";

// EDHREC rank 8977.

const SEARCH_TEXT =
  "When this creature enters, you may search your library for up to two creature cards with mana value 1 or less, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Ranger of Eos",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ranger"],
  power: 3,
  toughness: 2,
  text: SEARCH_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for up to two creature cards with mana value 1 or less?",
        effect: {
          kind: "search-library",
          filter: { type: "creature", manaValue: { op: "lte", n: 1 } },
          destination: "hand",
          min: 0,
          max: 2,
          reveal: true,
        },
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
