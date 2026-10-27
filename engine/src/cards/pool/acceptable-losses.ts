import { defineCard } from "../define.js";

// EDHREC rank 29281.

export default defineCard({
  name: "Acceptable Losses",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  additionalCost: { discard: 1, discardAtRandom: true },
  text: "As an additional cost to cast this spell, discard a card at random.\nAcceptable Losses deals 5 damage to target creature.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
});
