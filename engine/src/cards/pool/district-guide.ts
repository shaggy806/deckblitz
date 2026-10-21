import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may search your library for a basic land card or Gate card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "District Guide",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card or Gate card?",
        effect: {
          kind: "search-library",
          filter: { anyOf: [{ type: "land", supertype: "basic" }, { subtype: "Gate" }] },
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
