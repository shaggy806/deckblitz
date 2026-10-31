import { defineCard } from "../define.js";

const FACES = ["Give // Take", "Give", "Take"];
const LEFT_TEXT =
  "Put three +1/+1 counters on target creature.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Remove all +1/+1 counters from target creature you control. Draw that many cards.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; give.ts, take.ts).
export default defineCard({
  name: "Give // Take",
  manaCost: "{2}{G}{2}{U}",
  colors: ["U", "G"],
  types: ["sorcery"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
