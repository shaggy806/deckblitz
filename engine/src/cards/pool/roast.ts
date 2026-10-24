import { defineCard } from "../define.js";

export default defineCard({
  name: "Roast",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Roast deals 5 damage to target creature without flying.",
  targets: [{ kind: "permanent", filter: { type: "creature", notKeyword: "flying" } }],
  effect: { kind: "damage", amount: 5, target: 0 },
});
