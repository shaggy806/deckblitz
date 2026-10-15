import { defineCard } from "../define.js";

// EDHREC rank 15868.

const TEXT =
  "When this creature enters, you gain 2 life. You may search your library for a basic land card, reveal it, then shuffle and put that card on top.";

export default defineCard({
  name: "Old Thrush",
  manaCost: "{2}",
  colors: [],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          {
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
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
