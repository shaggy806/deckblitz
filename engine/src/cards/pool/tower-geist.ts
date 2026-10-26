import { defineCard } from "../define.js";

// EDHREC rank 24966. Sibsig Appraiser's trigger, word for word.
//
// Rulings:
//   If there's only one card in your library when Tower Geist enters, you'll look at that card
//     and put it into your hand.

const TEXT =
  "When this creature enters, look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.";

export default defineCard({
  name: "Tower Geist",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
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
      text: TEXT,
    },
  ],
});
