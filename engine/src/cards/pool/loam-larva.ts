import { defineCard } from "../define.js";

// EDHREC rank 18847. Campus Guide's trigger, word for word.
const TEXT =
  "When this creature enters, you may search your library for a basic land card, reveal it, then shuffle and put that card on top.";

export default defineCard({
  name: "Loam Larva",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
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
      resolve: null,
      text: TEXT,
    },
  ],
});
