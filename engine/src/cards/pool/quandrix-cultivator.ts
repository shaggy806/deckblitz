import { defineCard } from "../define.js";

// EDHREC rank 12292.
const ETB_TEXT =
  "When this creature enters, you may search your library for a basic Forest or Island card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Quandrix Cultivator",
  manaCost: "{1}{G}{G/U}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Turtle", "Druid"],
  power: 3,
  toughness: 4,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // "You may search" — declining doesn't search or shuffle at all.
      effect: {
        kind: "may",
        prompt: "Search your library for a basic Forest or Island card?",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land", subtypes: ["Forest", "Island"] },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
