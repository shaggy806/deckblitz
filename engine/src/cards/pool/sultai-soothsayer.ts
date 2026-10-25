import { defineCard } from "../define.js";

// EDHREC rank 25445.

const TEXT =
  "When this creature enters, look at the top four cards of your library. Put one of them into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Sultai Soothsayer",
  manaCost: "{2}{B}{G}{U}",
  colors: ["U", "B", "G"],
  types: ["creature"],
  subtypes: ["Snake", "Shaman"],
  power: 2,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
