import { defineCard } from "../define.js";

// Portal. EDHREC rank 29915.
export default defineCard({
  name: "Needle Storm",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Needle Storm deals 4 damage to each creature with flying.",
  targets: [],
  effect: { kind: "damage-all", amount: 4, filter: { type: "creature", keyword: "flying" } },
});
