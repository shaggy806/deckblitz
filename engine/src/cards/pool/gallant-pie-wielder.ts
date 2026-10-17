import { defineCard } from "../define.js";
import { CELEBRATION_CONDITION } from "../helpers.js";

// EDHREC rank 24866.
//
// Celebration (an ability word — rule 207.2c) reads the turn's history, not the
// board: nonland permanents that entered under your control this turn count
// though they've left or changed control since (the rulings).

export default defineCard({
  name: "Gallant Pie-Wielder",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Knight"],
  power: 2,
  toughness: 3,
  keywords: ["first-strike"],
  text: "First strike\nCelebration — This creature has double strike as long as two or more nonland permanents entered the battlefield under your control this turn.",
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["double-strike"],
      text: "Celebration — This creature has double strike as long as two or more nonland permanents entered the battlefield under your control this turn.",
      condition: CELEBRATION_CONDITION,
    },
  ],
});
