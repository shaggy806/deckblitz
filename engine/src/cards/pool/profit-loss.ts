import { defineCard } from "../define.js";

const FACES = ["Profit // Loss", "Profit", "Loss"];
const LEFT_TEXT =
  "Creatures you control get +1/+1 until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Creatures your opponents control get -1/-1 until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; profit.ts, loss.ts).
export default defineCard({
  name: "Profit // Loss",
  manaCost: "{1}{W}{2}{B}",
  colors: ["W", "B"],
  types: ["instant"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
