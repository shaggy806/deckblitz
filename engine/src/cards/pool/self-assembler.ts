import { defineCard } from "../define.js";

// Kaladesh. Any creature card with the Assembly-Worker subtype (the ruling).
const TEXT =
  "When this creature enters, you may search your library for an Assembly-Worker creature card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Self-Assembler",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Assembly-Worker creature card?",
        effect: {
          kind: "search-library",
          filter: { type: "creature", subtype: "Assembly-Worker" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
