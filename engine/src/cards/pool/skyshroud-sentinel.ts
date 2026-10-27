import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 32246.
//
// Squadron Hawk's search.

const TEXT =
  "When this creature enters, you may search your library for up to three cards named Skyshroud Sentinel, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Skyshroud Sentinel",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for up to three cards named Skyshroud Sentinel?",
        effect: {
          kind: "search-library",
          filter: { name: "Skyshroud Sentinel" },
          destination: "hand",
          reveal: true,
          min: 0,
          max: 3,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
