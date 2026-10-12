import { defineCard } from "../define.js";

export default defineCard({
  name: "Spontaneous Combustion",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nSpontaneous Combustion deals 3 damage to each creature.",
  effect: { kind: "damage-all", amount: 3, filter: { type: "creature" } },
});
