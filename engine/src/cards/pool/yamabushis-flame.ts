import { defineCard } from "../define.js";

// EDHREC rank 30186.

export default defineCard({
  name: "Yamabushi's Flame",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Yamabushi's Flame deals 3 damage to any target. If a creature dealt damage this way would die this turn, exile it instead.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
