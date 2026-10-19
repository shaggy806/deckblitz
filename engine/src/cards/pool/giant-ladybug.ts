import { defineCard } from "../define.js";

// EDHREC rank 19934.
const ENTER_TEXT =
  "When this creature enters, you may search your library for a basic land card, reveal it, then shuffle and put that card on top.";

export default defineCard({
  name: "Giant Ladybug",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 4,
  toughness: 1,
  keywords: ["reach"],
  text: `Reach\n${ENTER_TEXT}`,
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
      text: ENTER_TEXT,
    },
  ],
});
