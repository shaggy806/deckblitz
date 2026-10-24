import { defineCard } from "../define.js";

export default defineCard({
  name: "Puncturing Blow",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Puncturing Blow deals 5 damage to target creature. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 5, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
