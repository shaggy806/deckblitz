import { defineCard } from "../define.js";

// EDHREC rank 12556.

const TEXT =
  "When this creature dies, you may search your library for an Elf card, reveal that card, put it into your hand, then shuffle.";

export default defineCard({
  name: "Wirewood Herald",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Elf card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Elf" },
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
