import { defineCard } from "../define.js";

// EDHREC rank 32423.

const END_TEXT = "At the beginning of your end step, if this creature attacked this turn, sacrifice a nonland permanent.";

export default defineCard({
  name: "Targ Wrangler",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior"],
  power: 5,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "source", filter: { attackedThisTurn: true } },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { notTypes: ["land"] }, count: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
