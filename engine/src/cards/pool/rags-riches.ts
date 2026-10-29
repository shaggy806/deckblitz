import { defineCard } from "../define.js";

const FACES = ["Rags // Riches", "Rags", "Riches"];
const RAGS_TEXT = "All creatures get -2/-2 until end of turn.";
const RICHES_TEXT =
  "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nEach opponent chooses a creature they control. You gain control of those creatures.";

// EDHREC rank 15182.
//
// The whole card: every zone but the stack (rule 709.4). Never cast itself —
// a spell is one half or the other (rags.ts, and riches.ts with aftermath,
// rule 702.127a).
export default defineCard({
  name: "Rags // Riches",
  manaCost: "{2}{B}{B}{5}{U}{U}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: `${RAGS_TEXT}\n//\n${RICHES_TEXT}`,
  faces: FACES,
  split: true,
});
