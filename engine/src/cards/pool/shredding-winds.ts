import { defineCard } from "../define.js";

export default defineCard({
  name: "Shredding Winds",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Shredding Winds deals 7 damage to target creature with flying.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "damage", amount: 7, target: 0 },
});
