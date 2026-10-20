import { defineCard } from "../define.js";

// EDHREC rank 29325. Draconic Muralists' "you may search … reveal it, put it
// into your hand", for a card by name.

const DIES_TEXT =
  "When this creature dies, you may search your library for a card named Wretched Throng, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Wretched Throng",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 2,
  toughness: 1,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Wretched Throng?",
        effect: {
          kind: "search-library",
          filter: { name: "Wretched Throng" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
