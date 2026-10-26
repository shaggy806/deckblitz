import { defineCard } from "../define.js";

const FACES = ["Breaking // Entering", "Breaking", "Entering"];
const LEFT_TEXT =
  "Target player mills eight cards.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Put a creature card from a graveyard onto the battlefield under your control. It gains haste until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; breaking.ts, entering.ts).
export default defineCard({
  name: "Breaking // Entering",
  manaCost: "{U}{B}{4}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["sorcery"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
