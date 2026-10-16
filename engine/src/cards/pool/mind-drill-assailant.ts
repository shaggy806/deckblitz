import { defineCard } from "../define.js";

// EDHREC rank 15648. Billowing Shriekmass's threshold bonus and Rummaging
// Wizard's surveil, on a hybrid cost.
const THRESHOLD_TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +3/+0.";

export default defineCard({
  name: "Mind Drill Assailant",
  manaCost: "{2}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Rat", "Warlock"],
  power: 2,
  toughness: 5,
  text: `${THRESHOLD_TEXT}\n{2}{U/B}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [3, 0],
      text: THRESHOLD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U/B}", tap: false },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "{2}{U/B}: Surveil 1.",
    },
  ],
});
