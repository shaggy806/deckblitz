import { defineCard } from "../define.js";

// EDHREC rank 18310.

export default defineCard({
  name: "Improvised Club",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice an artifact or creature.\nImprovised Club deals 4 damage to any target.",
  additionalCost: { sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
