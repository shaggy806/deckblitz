import { defineCard } from "../define.js";

// EDHREC rank 26455.
//
// Rulings:
//   [2022-09-09] If there is only one card left in your library, that card is put into your hand.

const DIES_TEXT =
  "When this creature dies, look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.";

export default defineCard({
  name: "Talas Lookout",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
