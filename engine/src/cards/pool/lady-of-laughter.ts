import { defineCard } from "../define.js";
import { CELEBRATION_CONDITION } from "../helpers.js";

// EDHREC rank 19840.
//
// Celebration (an ability word — rule 207.2c) reads the turn's history, not the
// board: nonland permanents that entered under your control this turn count
// though they've left or changed control since (the rulings).

export default defineCard({
  name: "Lady of Laughter",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Faerie", "Noble"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nCelebration — At the beginning of your end step, if two or more nonland permanents entered the battlefield under your control this turn, draw a card.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Celebration — At the beginning of your end step, if two or more nonland permanents entered the battlefield under your control this turn, draw a card.",
      condition: CELEBRATION_CONDITION,
    },
  ],
});
