import { defineCard } from "../define.js";

// EDHREC rank 9934.

const ENTER_TEXT =
  "When this creature enters, you may search your library for a Forest card, put it onto the battlefield tapped under target player's control, then shuffle.";

export default defineCard({
  name: "Yavimaya Dryad",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 2,
  toughness: 1,
  keywords: ["forestwalk"],
  text: `Forestwalk (This creature can't be blocked as long as defending player controls a Forest.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Search your library for a Forest card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Forest", type: "land" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
          enterUnder: { target: 0 },
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
