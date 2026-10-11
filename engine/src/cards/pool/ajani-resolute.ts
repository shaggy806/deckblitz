import { defineCard } from "../define.js";

// EDHREC rank 11807.
// Makes Ajani's Pridemate → "Ajani's Pridemate Token" (named Ajani's Pridemate).
//
// Rulings:
//   [2026-08-21] If Ajani's Pridemate is dealt lethal damage at the same time that you gain life,
//     it won't receive a counter from its ability in time to save it.
//   [2026-08-21] Unlike the card Ajani's Pridemate, the token has no mana cost. Its mana value is 0.
//   [2026-08-21] If more than one creature you control with lifelink deals combat damage at the
//     same time, you will gain life that many times, and Ajani's first ability (as well as Ajani's
//     Pridemate's ability) will trigger that many times.

const GAIN_TEXT = "Whenever you gain life, put a loyalty counter on Ajani.";
const ZERO_TEXT = "0: You gain 1 life.";
const MINUS_TEXT =
  "−4: Create a 2/2 white Cat Soldier creature token named Ajani's Pridemate with \"Whenever you gain life, put a +1/+1 counter on this token.\"";
const ULTIMATE_TEXT = "−10: You get an emblem with \"Creatures you control get +2/+2.\"";
const EMBLEM_TEXT = "Creatures you control get +2/+2.";

export default defineCard({
  name: "Ajani Resolute",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 2,
  text: `${GAIN_TEXT}\n${ZERO_TEXT}\n${MINUS_TEXT}\n${ULTIMATE_TEXT}`,
  activated: [
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: ZERO_TEXT,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Ajani's Pridemate Token", count: 1 },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        static: { affects: { scope: "creatures-you-control" }, grantPt: [2, 2], text: EMBLEM_TEXT },
      },
      resolve: null,
      text: ULTIMATE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "loyalty", amount: 1 },
      resolve: null,
      text: GAIN_TEXT,
    },
  ],
});
