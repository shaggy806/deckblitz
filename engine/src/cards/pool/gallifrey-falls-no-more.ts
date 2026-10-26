import { defineCard } from "../define.js";

const FACES = ["Gallifrey Falls // No More", "Gallifrey Falls", "No More"];
const LEFT_TEXT =
  "Gallifrey Falls deals 4 damage to each creature. If a creature dealt damage this way would die this turn, exile it instead.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Any number of target creatures you control phase out.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; gallifrey-falls.ts, no-more.ts).
export default defineCard({
  name: "Gallifrey Falls // No More",
  manaCost: "{4}{R}{R}{2}{W}",
  colors: ["W", "R"],
  types: ["instant"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
