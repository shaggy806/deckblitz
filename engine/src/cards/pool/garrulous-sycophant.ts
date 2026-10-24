import { defineCard } from "../define.js";

export default defineCard({
  name: "Garrulous Sycophant",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 4,
  text: "At the beginning of your end step, if you're the monarch, each opponent loses 1 life and you gain 1 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "monarch", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: "At the beginning of your end step, if you're the monarch, each opponent loses 1 life and you gain 1 life.",
    },
  ],
});
