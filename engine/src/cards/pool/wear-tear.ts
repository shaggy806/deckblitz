import { defineCard } from "../define.js";

const FACES = ["Wear // Tear", "Wear", "Tear"];
const LEFT_TEXT =
  "Destroy target artifact.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Destroy target enchantment.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; wear.ts, tear.ts).
export default defineCard({
  name: "Wear // Tear",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
