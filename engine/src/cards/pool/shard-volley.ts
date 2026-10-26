import { defineCard } from "../define.js";

// EDHREC rank 25934. Morningtide.

export default defineCard({
  name: "Shard Volley",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice a land.\nShard Volley deals 3 damage to any target.",
  additionalCost: { sacrifice: { type: "land", controlledBy: "you" } },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
