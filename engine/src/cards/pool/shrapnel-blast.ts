import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 18179. Exactly one artifact, as a cost (the
// rulings): Incendiary Sabotage's additional cost.

export default defineCard({
  name: "Shrapnel Blast",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice an artifact.\nShrapnel Blast deals 5 damage to any target.",
  additionalCost: { sacrifice: { type: "artifact", controlledBy: "you" } },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 5, target: 0 },
});
