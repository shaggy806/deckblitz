import { defineCard } from "../define.js";

const FACES = ["Double Jump // Flying Kick", "Double Jump", "Flying Kick"];
const LEFT_TEXT =
  "Put a flying counter on target creature you control. Until end of turn, it has base power and toughness 5/5.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Target creature you control deals damage equal to its power to target creature an opponent controls.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; double-jump.ts, flying-kick.ts).
export default defineCard({
  name: "Double Jump // Flying Kick",
  manaCost: "{1}{U}{1}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
