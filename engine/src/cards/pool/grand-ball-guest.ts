import { defineCard } from "../define.js";
import { CELEBRATION_CONDITION } from "../helpers.js";

// EDHREC rank 28899.
//
// Celebration (an ability word — rule 207.2c) reads the turn's history, not the
// board: nonland permanents that entered under your control this turn count
// though they've left or changed control since (the rulings).

export default defineCard({
  name: "Grand Ball Guest",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 2,
  text: "Celebration — This creature gets +1/+1 and has trample as long as two or more nonland permanents entered the battlefield under your control this turn.",
  static: [
    {
      affects: { scope: "self" },
      grantPt: [1, 1],
      grantKeywords: ["trample"],
      text: "Celebration — This creature gets +1/+1 and has trample as long as two or more nonland permanents entered the battlefield under your control this turn.",
      condition: CELEBRATION_CONDITION,
    },
  ],
});
