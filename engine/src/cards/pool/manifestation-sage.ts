import { defineCard } from "../define.js";

// EDHREC rank 21564.
//
// Rulings:
//   [2021-04-16] X is number of cards in your hand as Manifestation Sage's triggered ability
//     resolves.
const ETB_TEXT =
  "When this creature enters, create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of cards in your hand.";

export default defineCard({
  name: "Manifestation Sage",
  manaCost: "{G/U}{G/U}{G/U}{G/U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Fractal Token",
        count: 1,
        thenCounters: { kind: "+1/+1", amount: { cardsInHand: "you" } },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
