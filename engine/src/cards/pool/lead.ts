import { defineCard } from "../define.js";

// The aftermath half of Destined // Lead: cast only from a graveyard, then
// exiled (rule 702.127a). Lead forces only the creatures already able to block
// the target to do so (its ruling) — Roar of Challenge's `must-be-blocked`.
const FACES = ["Destined // Lead", "Destined", "Lead"];

export default defineCard({
  name: "Lead",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nAll creatures able to block target creature this turn do so.",
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["must-be-blocked"] },
  faces: FACES,
  split: true,
  aftermath: true,
});
