import { defineCard } from "../define.js";

export default defineCard({
  name: "Sonic Seizure",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  additionalCost: { discard: 1, discardAtRandom: true },
  text: "As an additional cost to cast this spell, discard a card at random.\nSonic Seizure deals 3 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
