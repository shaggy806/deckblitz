import { defineCard } from "../define.js";

export default defineCard({
  name: "Reduce to Ashes",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Reduce to Ashes deals 5 damage to target creature. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 5, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
