import { defineCard } from "../define.js";

// EDHREC rank 31235. Battalion Foot Soldier's shape.

const TEXT =
  "When this creature enters, you may search your library for any number of cards named Legion Conquistador, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Legion Conquistador",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for any number of cards named Legion Conquistador?",
        effect: {
          kind: "search-library",
          filter: { name: "Legion Conquistador" },
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
