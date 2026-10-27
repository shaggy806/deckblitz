import { defineCard } from "../define.js";

// Champions of Kamigawa.

export default defineCard({
  name: "Gale Force",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Gale Force deals 5 damage to each creature with flying.",
  effect: { kind: "damage-all", amount: 5, filter: { type: "creature", keyword: "flying" } },
});
