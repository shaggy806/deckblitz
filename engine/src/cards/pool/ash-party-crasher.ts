import { defineCard } from "../define.js";
import { CELEBRATION_CONDITION } from "../helpers.js";

// EDHREC rank 16134.
//
// Celebration (an ability word — rule 207.2c) reads the turn's history, not the
// board: nonland permanents that entered under your control this turn count
// though they've left or changed control since (the rulings).

export default defineCard({
  name: "Ash, Party Crasher",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nCelebration — Whenever Ash attacks, if two or more nonland permanents entered the battlefield under your control this turn, put a +1/+1 counter on Ash.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Celebration — Whenever Ash attacks, if two or more nonland permanents entered the battlefield under your control this turn, put a +1/+1 counter on Ash.",
      condition: CELEBRATION_CONDITION,
    },
  ],
});
