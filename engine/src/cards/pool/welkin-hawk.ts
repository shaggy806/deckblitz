import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] You do not have to find a Welkin Hawk card if you do not want to.

const DIES_TEXT =
  "When this creature dies, you may search your library for a card named Welkin Hawk, reveal that card, put it into your hand, then shuffle.";

export default defineCard({
  name: "Welkin Hawk",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card named Welkin Hawk?",
        effect: {
          kind: "search-library",
          filter: { name: "Welkin Hawk" },
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
