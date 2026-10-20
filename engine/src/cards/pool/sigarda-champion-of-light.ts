import { defineCard } from "../define.js";

// EDHREC rank 12132.
//
// Rulings:
//   [2021-09-24] Many coven abilities are triggered abilities with intervening if clauses. You
//     must control three or more creatures with different powers at the time the ability
//     triggers and at the time the ability tries to resolve.

const COVEN_TEXT =
  "Coven — Whenever Sigarda attacks, if you control three or more creatures with different powers, look at the " +
  "top five cards of your library. You may reveal a Human creature card from among them and put it into your " +
  "hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Sigarda, Champion of Light",
  manaCost: "{1}{G}{W}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "trample"],
  text: `Flying, trample\nHumans you control get +1/+1.\n${COVEN_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Human" },
      grantPt: [1, 1],
      text: "Humans you control get +1/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "coven" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature", subtype: "Human" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: COVEN_TEXT,
    },
  ],
});
