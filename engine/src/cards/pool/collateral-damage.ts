import { defineCard } from "../define.js";

export default defineCard({
  name: "Collateral Damage",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nCollateral Damage deals 3 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
