import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may search your library for up to three cards named Howling Wolf, reveal them, put them into your hand, then shuffle.";

export default defineCard({
  name: "Howling Wolf",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for up to three cards named Howling Wolf?",
        effect: {
          kind: "search-library",
          filter: { name: "Howling Wolf" },
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
