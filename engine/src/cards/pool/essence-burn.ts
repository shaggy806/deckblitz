import { defineCard } from "../define.js";

export default defineCard({
  name: "Essence Burn",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Essence Burn deals 5 damage to target black or green creature or planeswalker. If that permanent would die this turn, exile it instead.",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { typesAnyOf: ["creature", "planeswalker"], anyOf: [{ colors: ["B"] }, { colors: ["G"] }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 5, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
