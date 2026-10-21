import { defineCard } from "../define.js";

// EDHREC rank 22670. Exactly one creature or planeswalker sacrificed as the
// cost.

export default defineCard({
  name: "Heartfire",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice a creature or planeswalker.\nHeartfire deals 4 damage to any target.",
  additionalCost: { sacrifice: { typesAnyOf: ["creature", "planeswalker"] } },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
