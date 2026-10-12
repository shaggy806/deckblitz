import { defineCard } from "../define.js";

export default defineCard({
  name: "Leaf Arrow",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Leaf Arrow deals 3 damage to target creature with flying.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "damage", amount: 3, target: 0 },
});
