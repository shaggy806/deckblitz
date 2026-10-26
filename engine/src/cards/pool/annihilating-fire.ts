import { defineCard } from "../define.js";

// EDHREC rank 19989. Incendiary Flow's shape.

export default defineCard({
  name: "Annihilating Fire",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Annihilating Fire deals 3 damage to any target. If a creature dealt damage this way would die this turn, exile it instead.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
