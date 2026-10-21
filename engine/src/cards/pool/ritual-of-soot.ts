import { defineCard } from "../define.js";

export default defineCard({
  name: "Ritual of Soot",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all creatures with mana value 3 or less.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
});
