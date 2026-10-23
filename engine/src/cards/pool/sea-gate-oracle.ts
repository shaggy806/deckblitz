import { defineCard } from "../define.js";

// EDHREC rank 7839.
//
// Rulings:
//   If there's only one card in your library as Sea Gate Oracle's ability resolves, you'll put it
//     into your hand.
//
// Sleight of Hand's look-and-choose, on entering.

const TEXT =
  "When this creature enters, look at the top two cards of your library. Put one of them into your hand and the other on the bottom of your library.";

export default defineCard({
  name: "Sea Gate Oracle",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
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
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
