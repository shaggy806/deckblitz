import { defineCard } from "../define.js";

// The aftermath half of Heaven // Earth: cast only from a graveyard, then
// exiled (rule 702.127a).
const FACES = ["Heaven // Earth", "Heaven", "Earth"];

export default defineCard({
  name: "Earth",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nEarth deals X damage to each creature without flying.",
  effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: "x" },
  faces: FACES,
  split: true,
  aftermath: true,
});
