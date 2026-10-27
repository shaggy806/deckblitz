import { defineCard } from "../define.js";

// EDHREC rank 26789.

export default defineCard({
  name: "Yamabushi's Storm",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Yamabushi's Storm deals 1 damage to each creature. If a creature dealt damage this way would die this turn, exile it instead.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: 1, filter: { type: "creature" } },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
