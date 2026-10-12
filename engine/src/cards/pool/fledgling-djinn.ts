import { defineCard } from "../define.js";

export default defineCard({
  name: "Fledgling Djinn",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, this creature deals 1 damage to you.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "you" },
      resolve: null,
      text: "At the beginning of your upkeep, this creature deals 1 damage to you.",
    },
  ],
});
