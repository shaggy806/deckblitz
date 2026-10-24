import { defineCard } from "../define.js";

// EDHREC rank 27385.
export default defineCard({
  name: "Incendiary Sabotage",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice an artifact.\nIncendiary Sabotage deals 3 damage to each creature.",
  targets: [],
  additionalCost: { sacrifice: { type: "artifact", controlledBy: "you" } },
  effect: { kind: "damage-all", amount: 3, filter: { type: "creature" } },
});
