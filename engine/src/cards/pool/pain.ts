import { defineCard } from "../define.js";

// The left half of Pain // Suffering (see pain-suffering.ts).
const FACES = ["Pain // Suffering", "Pain", "Suffering"];

export default defineCard({
  name: "Pain",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards a card.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 1 },
  faces: FACES,
  split: true,
});
