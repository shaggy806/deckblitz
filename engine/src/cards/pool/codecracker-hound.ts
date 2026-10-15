import { defineCard } from "../define.js";

// EDHREC rank 17977.
//
// Rulings:
//   [2025-07-25] If there’s only one card in your library as Codecracker Hound’s first ability
//     resolves, you’ll put that card into your hand.

const ENTER_TEXT =
  "When this creature enters, look at the top two cards of your library. Put one into your hand and the other into your graveyard.";

export default defineCard({
  name: "Codecracker Hound",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 1,
  text: `${ENTER_TEXT}\nWarp {2}{U} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)`,
  warp: { cost: "{2}{U}" },
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
      text: ENTER_TEXT,
    },
  ],
});
