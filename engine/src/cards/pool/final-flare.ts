import { defineCard } from "../define.js";

// Theros Beyond Death.

export default defineCard({
  name: "Final Flare",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice a creature or enchantment.\nFinal Flare deals 5 damage to target creature.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
  additionalCost: { sacrifice: { typesAnyOf: ["creature", "enchantment"], controlledBy: "you" } },
});
