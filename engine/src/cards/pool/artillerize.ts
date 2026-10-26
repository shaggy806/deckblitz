import { defineCard } from "../define.js";

export default defineCard({
  name: "Artillerize",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice an artifact or creature.\nArtillerize deals 5 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 5, target: 0 },
  additionalCost: { sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
});
