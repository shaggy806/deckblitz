import { defineCard } from "../define.js";

const FACES = ["Armed // Dangerous", "Armed", "Dangerous"];
const LEFT_TEXT =
  "Target creature gets +1/+1 and gains double strike until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "All creatures able to block target creature this turn do so.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; armed.ts, dangerous.ts).
export default defineCard({
  name: "Armed // Dangerous",
  manaCost: "{1}{R}{3}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
