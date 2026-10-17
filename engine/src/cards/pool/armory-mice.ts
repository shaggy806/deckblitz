import { defineCard } from "../define.js";
import { CELEBRATION_CONDITION } from "../helpers.js";

// EDHREC rank 18176.
//
// Celebration (an ability word — rule 207.2c) reads the turn's history, not the
// board: nonland permanents that entered under your control this turn count
// though they've left or changed control since (the rulings).

export default defineCard({
  name: "Armory Mice",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Mouse"],
  power: 3,
  toughness: 1,
  text: "Celebration — This creature gets +0/+2 as long as two or more nonland permanents entered the battlefield under your control this turn.",
  static: [
    {
      affects: { scope: "self" },
      grantPt: [0, 2],
      text: "Celebration — This creature gets +0/+2 as long as two or more nonland permanents entered the battlefield under your control this turn.",
      condition: CELEBRATION_CONDITION,
    },
  ],
});
