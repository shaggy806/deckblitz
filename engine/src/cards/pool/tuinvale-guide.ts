import { defineCard } from "../define.js";
import { CELEBRATION_CONDITION } from "../helpers.js";

// EDHREC rank 29312.
//
// Celebration (an ability word — rule 207.2c) reads the turn's history, not the
// board: nonland permanents that entered under your control this turn count
// though they've left or changed control since (the rulings).

export default defineCard({
  name: "Tuinvale Guide",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Faerie", "Scout"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nCelebration — This creature gets +1/+0 and has lifelink as long as two or more nonland permanents entered the battlefield under your control this turn.",
  static: [
    {
      affects: { scope: "self" },
      grantPt: [1, 0],
      grantKeywords: ["lifelink"],
      text: "Celebration — This creature gets +1/+0 and has lifelink as long as two or more nonland permanents entered the battlefield under your control this turn.",
      condition: CELEBRATION_CONDITION,
    },
  ],
});
