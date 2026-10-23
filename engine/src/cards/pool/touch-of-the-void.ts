import { defineCard } from "../define.js";

// EDHREC rank 27194.

export default defineCard({
  name: "Touch of the Void",
  manaCost: "{2}{R}",
  colors: [],
  types: ["sorcery"],
  text: "Devoid (This card has no color.)\nTouch of the Void deals 3 damage to any target. If a creature dealt damage this way would die this turn, exile it instead.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
