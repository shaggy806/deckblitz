import { defineCard } from "../define.js";

export default defineCard({
  name: "Juzám Djinn",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 5,
  text: "At the beginning of your upkeep, this creature deals 1 damage to you.",
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
