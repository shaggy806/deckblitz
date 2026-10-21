import { defineCard } from "../define.js";

// EDHREC rank 7746.
//
// Rulings:
//   [2019-10-04] If an effect instructs you to draw multiple cards, the ability triggers after you
//     draw whichever is the second one for the turn. You choose a target (if any) for the ability
//     after you've drawn and looked at all of the cards and finished resolving the spell or
//     ability that caused you to draw them.
//   [2019-10-04] The triggered ability can trigger only once each turn. It won't trigger when the
//     third or fourth card is drawn.

const TEXT = "Whenever you draw your second card each turn, this creature deals 3 damage to any target.";

export default defineCard({
  name: "Irencrag Pyromancer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
