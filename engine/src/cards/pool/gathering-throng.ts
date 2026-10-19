import { defineCard } from "../define.js";

// "Any number": up to every card in the library.
const TEXT =
  "When this creature enters, you may search your library for any number of cards named Gathering Throng, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Gathering Throng",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for any number of cards named Gathering Throng?",
        effect: {
          kind: "search-library",
          filter: { name: "Gathering Throng" },
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
