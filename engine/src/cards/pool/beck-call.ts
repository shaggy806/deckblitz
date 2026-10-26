import { defineCard } from "../define.js";

const FACES = ["Beck // Call", "Beck", "Call"];
const LEFT_TEXT =
  "Whenever a creature enters this turn, you may draw a card.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Create four 1/1 white Bird creature tokens with flying.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; beck.ts, call.ts).
export default defineCard({
  name: "Beck // Call",
  manaCost: "{G}{U}{4}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["sorcery"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
