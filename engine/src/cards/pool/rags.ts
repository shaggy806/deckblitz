import { defineCard } from "../define.js";

// The half of Rags // Riches cast from the hand. Only the creatures on the
// battlefield as it resolves get -2/-2 (the ruling).
const FACES = ["Rags // Riches", "Rags", "Riches"];

export default defineCard({
  name: "Rags",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All creatures get -2/-2 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: -2,
    toughness: -2,
    duration: "end-of-turn",
  },
  faces: FACES,
  split: true,
});
