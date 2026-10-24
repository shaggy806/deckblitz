import { defineCard } from "../define.js";

export default defineCard({
  name: "Anger of the Gods",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Anger of the Gods deals 3 damage to each creature. If a creature dealt damage this way would die this turn, exile it instead.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: 3, filter: { type: "creature" } },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
    ],
  },
});
