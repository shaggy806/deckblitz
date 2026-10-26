import { defineCard } from "../define.js";

const FACES = ["Far // Away", "Far", "Away"];
const LEFT_TEXT =
  "Return target creature to its owner's hand.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Target player sacrifices a creature of their choice.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; far.ts, away.ts).
export default defineCard({
  name: "Far // Away",
  manaCost: "{1}{U}{2}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
