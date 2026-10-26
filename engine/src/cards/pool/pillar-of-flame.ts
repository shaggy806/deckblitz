import { defineCard } from "../define.js";

// EDHREC rank 20284.

export default defineCard({
  name: "Pillar of Flame",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Pillar of Flame deals 2 damage to any target. If a creature dealt damage this way would die this turn, exile it instead.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
