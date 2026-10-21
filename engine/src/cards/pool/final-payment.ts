import { defineCard } from "../define.js";

// Ravnica Allegiance. Bitter Triumph's choice of additional costs.
export default defineCard({
  name: "Final Payment",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, pay 5 life or sacrifice a creature or enchantment.\nDestroy target creature.",
  additionalCost: {
    options: [
      { text: "Pay 5 life", payLife: 5 },
      {
        text: "Sacrifice a creature or enchantment",
        sacrifice: { typesAnyOf: ["creature", "enchantment"], controlledBy: "you" },
      },
    ],
  },
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
});
