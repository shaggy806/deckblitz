import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may search your library for a card with the same name as another creature you control, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Pattern Matcher",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card with the same name as another creature you control?",
        effect: {
          kind: "search-library",
          filter: { sameNameWith: { controlled: { type: "creature", isSource: false } } },
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
