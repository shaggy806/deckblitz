import { defineCard } from "../define.js";

const FACES = ["Alive // Well", "Alive", "Well"];
const LEFT_TEXT =
  "Create a 3/3 green Centaur creature token.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "You gain 2 life for each creature you control.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; alive.ts, well.ts).
export default defineCard({
  name: "Alive // Well",
  manaCost: "{3}{G}{W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
