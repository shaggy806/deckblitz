import { defineCard } from "../define.js";

export default defineCard({
  name: "Sonic Burst",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  additionalCost: { discard: 1, discardAtRandom: true },
  text: "As an additional cost to cast this spell, discard a card at random.\nSonic Burst deals 4 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
