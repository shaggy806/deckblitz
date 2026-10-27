import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 31960. Wretched Throng's self-tutor on entering.
//
// Rulings:
//   The "If you do" means "If you search". (The shuffle sits inside the may.)

const ETB_TEXT =
  "When this creature enters, you may search your library for a card named Screaming Seahawk, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Screaming Seahawk",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Screaming Seahawk?",
        effect: {
          kind: "search-library",
          filter: { name: "Screaming Seahawk" },
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
