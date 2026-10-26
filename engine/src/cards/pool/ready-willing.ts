import { defineCard } from "../define.js";

const FACES = ["Ready // Willing", "Ready", "Willing"];
const LEFT_TEXT =
  "Creatures you control gain indestructible until end of turn. Untap each creature you control.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Creatures you control gain deathtouch and lifelink until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; ready.ts, willing.ts).
export default defineCard({
  name: "Ready // Willing",
  manaCost: "{1}{G}{W}{1}{W}{B}",
  colors: ["W", "B", "G"],
  types: ["instant"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
