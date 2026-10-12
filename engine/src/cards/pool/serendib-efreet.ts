import { defineCard } from "../define.js";

export default defineCard({
  name: "Serendib Efreet",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 3,
  toughness: 4,
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
