import { defineCard } from "../define.js";

export default defineCard({
  name: "Pierce the Sky",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Pierce the Sky deals 7 damage to target creature with flying.",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "damage", amount: 7, target: 0 },
});
