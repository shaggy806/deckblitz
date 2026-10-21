import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may search your library for any number of cards named Battalion Foot Soldier, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Battalion Foot Soldier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for any number of cards named Battalion Foot Soldier?",
        effect: {
          kind: "search-library",
          filter: { name: "Battalion Foot Soldier" },
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
