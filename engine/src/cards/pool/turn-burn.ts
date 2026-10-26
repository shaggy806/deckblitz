import { defineCard } from "../define.js";

const FACES = ["Turn // Burn", "Turn", "Burn"];
const LEFT_TEXT =
  "Until end of turn, target creature loses all abilities and becomes a red Weird with base power and toughness 0/1.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Burn deals 2 damage to any target.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; turn.ts, burn.ts).
export default defineCard({
  name: "Turn // Burn",
  manaCost: "{2}{U}{1}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
