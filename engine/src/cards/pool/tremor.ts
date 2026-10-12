import { defineCard } from "../define.js";

export default defineCard({
  name: "Tremor",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Tremor deals 1 damage to each creature without flying.",
  effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 1 },
});
