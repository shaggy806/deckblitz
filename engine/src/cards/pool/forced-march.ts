import { defineCard } from "../define.js";

export default defineCard({
  name: "Forced March",
  manaCost: "{X}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy all creatures with mana value X or less.",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", manaValue: { op: "lte", n: "x" } } },
});
