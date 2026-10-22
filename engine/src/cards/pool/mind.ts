import { defineCard } from "../define.js";

// The aftermath half of Spring // Mind: cast only from a graveyard, then
// exiled (rule 702.127a).
const FACES = ["Spring // Mind", "Spring", "Mind"];

export default defineCard({
  name: "Mind",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nDraw two cards.",
  effect: { kind: "draw", amount: 2 },
  faces: FACES,
  split: true,
  aftermath: true,
});
