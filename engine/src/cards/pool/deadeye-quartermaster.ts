import { defineCard } from "../define.js";

// EDHREC rank 9180. Ixalan. Caradora, Heart of Alacria's optional tutor for
// either of two artifact subtypes.
const TEXT =
  "When this creature enters, you may search your library for an Equipment or Vehicle card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Deadeye Quartermaster",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Equipment or Vehicle card?",
        effect: {
          kind: "search-library",
          filter: { subtypes: ["Equipment", "Vehicle"] },
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
