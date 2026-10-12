import { defineCard } from "../define.js";

export default defineCard({
  name: "Nettletooth Djinn",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 4,
  toughness: 4,
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
