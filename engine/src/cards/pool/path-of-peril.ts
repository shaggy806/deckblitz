import { defineCard } from "../define.js";

// EDHREC rank 18870.

export default defineCard({
  name: "Path of Peril",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Cleave {4}{W}{B} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nDestroy all creatures [with mana value 2 or less].",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } },
  cleave: {
    cost: "{4}{W}{B}",
    targets: [],
    effect: { kind: "destroy-all", filter: { type: "creature" } },
  },
});
