import { defineCard } from "../define.js";

// The aftermath half of Refuse // Cooperate: cast only from a graveyard, then exiled
// (rule 702.127a).
const FACES = ["Refuse // Cooperate", "Refuse", "Cooperate"];

export default defineCard({
  name: "Cooperate",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nCopy target instant or sorcery spell. You may choose new targets for the copy.",
  targets: ["instant-or-sorcery-spell"],
  effect: { kind: "copy-spell", target: 0, newTargets: true },
  faces: FACES,
  split: true,
  aftermath: true,
});
