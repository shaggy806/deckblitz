import { defineCard } from "../define.js";

// The aftermath half of Start // Finish: cast only from a graveyard, then
// exiled (rule 702.127a). Bone Splinters' additional cost.
const FACES = ["Start // Finish", "Start", "Finish"];

export default defineCard({
  name: "Finish",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nAs an additional cost to cast this spell, sacrifice a creature.\nDestroy target creature.",
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  faces: FACES,
  split: true,
  aftermath: true,
});
