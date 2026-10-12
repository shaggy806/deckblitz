import { defineCard } from "../define.js";

export default defineCard({
  name: "Fiery Conclusion",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nFiery Conclusion deals 5 damage to target creature.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
});
