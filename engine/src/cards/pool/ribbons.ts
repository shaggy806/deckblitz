import { defineCard } from "../define.js";

// The aftermath half of Cut // Ribbons: cast only from a graveyard, then
// exiled (rule 702.127a).
const FACES = ["Cut // Ribbons", "Cut", "Ribbons"];

export default defineCard({
  name: "Ribbons",
  manaCost: "{X}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nEach opponent loses X life.",
  effect: { kind: "lose-life", amount: "x", who: "each-opponent" },
  faces: FACES,
  split: true,
  aftermath: true,
});
