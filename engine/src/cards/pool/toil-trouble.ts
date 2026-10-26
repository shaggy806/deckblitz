import { defineCard } from "../define.js";

const FACES = ["Toil // Trouble", "Toil", "Trouble"];
const LEFT_TEXT =
  "Target player draws two cards and loses 2 life.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Trouble deals damage to target player equal to the number of cards in that player's hand.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; toil.ts, trouble.ts).
export default defineCard({
  name: "Toil // Trouble",
  manaCost: "{2}{B}{2}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
