import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may search your library for any number of cards named Andromedan Automatons, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Andromedan Automatons",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Android"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for any number of cards named Andromedan Automatons?",
        effect: {
          kind: "search-library",
          filter: { name: "Andromedan Automatons" },
          destination: "hand",
          reveal: true,
          min: 0,
          max: { librarySize: "you" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
