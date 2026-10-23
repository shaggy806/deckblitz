import { defineCard } from "../define.js";

export default defineCard({
  name: "Incendiary Flow",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Incendiary Flow deals 3 damage to any target. If a creature dealt damage this way would die this turn, exile it instead.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
