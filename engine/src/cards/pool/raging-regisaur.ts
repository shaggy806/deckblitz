import { defineCard } from "../define.js";

export default defineCard({
  name: "Raging Regisaur",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 4,
  text: "Whenever this creature attacks, it deals 1 damage to any target.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "Whenever this creature attacks, it deals 1 damage to any target.",
    },
  ],
});
