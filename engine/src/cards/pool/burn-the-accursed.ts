import { defineCard } from "../define.js";

export default defineCard({
  name: "Burn the Accursed",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Burn the Accursed deals 5 damage to target creature and 2 damage to that creature's controller. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 5, target: 0 },
          { kind: "damage", amount: 2, toControllerOfTarget: 0 },
        ],
      },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
