import { defineCard } from "../define.js";

const END_TEXT =
  "At the beginning of your end step, if an opponent lost life this turn, put a +1/+1 counter on this creature and draw a card.";

export default defineCard({
  name: "Lion Vulture",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cat", "Bird"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${END_TEXT} (Damage causes loss of life.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
