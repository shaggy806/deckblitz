import { defineCard } from "../define.js";

export default defineCard({
  name: "Feed the Flames",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Feed the Flames deals 5 damage to target creature. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 5, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
