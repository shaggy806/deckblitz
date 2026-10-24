import { defineCard } from "../define.js";

export default defineCard({
  name: "Obliterating Bolt",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Obliterating Bolt deals 4 damage to target creature or planeswalker. If that creature or planeswalker would die this turn, exile it instead.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
