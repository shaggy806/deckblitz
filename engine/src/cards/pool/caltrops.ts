import { defineCard } from "../define.js";

// EDHREC rank 5350.

export default defineCard({
  name: "Caltrops",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "Whenever a creature attacks, this artifact deals 1 damage to it.",
  triggered: [
    {
      trigger: { on: "attacks", who: "any" },
      targets: [],
      effect: { kind: "damage", amount: 1, target: "trigger-object" },
      resolve: null,
      text: "Whenever a creature attacks, this artifact deals 1 damage to it.",
    },
  ],
});
