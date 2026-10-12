import { defineCard } from "../define.js";

export default defineCard({
  name: "Ravenous Giant",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
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
