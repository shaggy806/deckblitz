import { defineCard } from "../define.js";

// EDHREC rank 21764.

const ENTER_TEXT =
  "When this creature enters, look at the top three cards of your library. You may put one of those cards back on top of your library. Put the rest into your graveyard.";

export default defineCard({
  name: "Gurmag Nightwatch",
  manaCost: "{2/B}{2/G}{2/U}",
  colors: ["U", "B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 3,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 0,
        max: 1,
        destination: "library-top",
        leftover: "graveyard",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
