import { defineCard } from "../define.js";

export default defineCard({
  name: "Fated Conflagration",
  manaCost: "{1}{R}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Fated Conflagration deals 5 damage to target creature or planeswalker. If it's your turn, scry 2.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "conditional", condition: { kind: "your-turn" }, then: { kind: "scry", amount: 2 } },
    ],
  },
});
