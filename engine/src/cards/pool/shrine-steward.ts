import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 11029.

const ETB_TEXT =
  "When this creature enters, you may search your library for an Aura or Shrine card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Shrine Steward",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Aura or Shrine card?",
        effect: {
          kind: "search-library",
          filter: { subtypes: ["Aura", "Shrine"] },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
