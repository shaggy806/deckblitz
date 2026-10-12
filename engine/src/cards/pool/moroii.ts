import { defineCard } from "../define.js";

export default defineCard({
  name: "Moroii",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, you lose 1 life.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, you lose 1 life.",
    },
  ],
});
