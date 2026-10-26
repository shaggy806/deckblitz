import { defineCard } from "../define.js";

const FACES = ["Protect // Serve", "Protect", "Serve"];
const LEFT_TEXT =
  "Target creature gets +2/+4 until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Target creature gets -6/-0 until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; protect.ts, serve.ts).
export default defineCard({
  name: "Protect // Serve",
  manaCost: "{2}{W}{1}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
