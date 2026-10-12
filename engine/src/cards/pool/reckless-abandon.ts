import { defineCard } from "../define.js";

export default defineCard({
  name: "Reckless Abandon",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nReckless Abandon deals 4 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
