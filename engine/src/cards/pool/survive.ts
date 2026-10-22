import { defineCard } from "../define.js";

// The aftermath half of Struggle // Survive: cast only from a graveyard, then exiled
// (rule 702.127a).
const FACES = ["Struggle // Survive", "Struggle", "Survive"];

export default defineCard({
  name: "Survive",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nEach player shuffles their graveyard into their library.",
  targets: [],
  effect: { kind: "shuffle-graveyard-into-library", target: "each-player" },
  faces: FACES,
  split: true,
  aftermath: true,
});
