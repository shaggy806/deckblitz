import { defineCard } from "../define.js";

// The aftermath half of Onward // Victory: cast only from a graveyard, then
// exiled (rule 702.127a).
const FACES = ["Onward // Victory", "Onward", "Victory"];

export default defineCard({
  name: "Victory",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nTarget creature gains double strike until end of turn.",
  targets: ["creature"],
  effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
  faces: FACES,
  split: true,
  aftermath: true,
});
