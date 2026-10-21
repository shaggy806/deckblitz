import { defineCard } from "../define.js";

// EDHREC rank 23441. Stromkirk Bloodthief's intervening-if, on itself.

const TEXT =
  "At the beginning of your end step, if an opponent lost life this turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Savage Gorger",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Damage causes loss of life.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
