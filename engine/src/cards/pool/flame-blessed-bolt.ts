import { defineCard } from "../define.js";

export default defineCard({
  name: "Flame-Blessed Bolt",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Flame-Blessed Bolt deals 2 damage to target creature or planeswalker. If that creature or planeswalker would die this turn, exile it instead.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
