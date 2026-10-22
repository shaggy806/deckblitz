import { defineCard } from "../define.js";

// The aftermath half of Consign // Oblivion: cast only from a graveyard, then exiled
// (rule 702.127a).
const FACES = ["Consign // Oblivion", "Consign", "Oblivion"];

export default defineCard({
  name: "Oblivion",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nTarget opponent discards two cards.",
  targets: ["opponent"],
  effect: { kind: "discard", target: 0, amount: 2 },
  faces: FACES,
  split: true,
  aftermath: true,
});
