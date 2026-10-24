import { defineCard } from "../define.js";

// Three different creatures (the ruling); each slot keeps its own amount if
// another goes illegal.
export default defineCard({
  name: "Serpentine Spike",
  manaCost: "{5}{R}{R}",
  colors: [],
  types: ["sorcery"],
  text: "Devoid (This card has no color.)\nSerpentine Spike deals 2 damage to target creature, 3 damage to another target creature, and 4 damage to a third target creature. If a creature dealt damage this way would die this turn, exile it instead.",
  targets: [
    "creature",
    { kind: "other", of: "creature", than: { slots: [0] } },
    { kind: "other", of: "creature", than: { slots: [0, 1] } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "damage", amount: 3, target: 1 },
      { kind: "damage", amount: 4, target: 2 },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
