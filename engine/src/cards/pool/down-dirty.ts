import { defineCard } from "../define.js";

const FACES = ["Down // Dirty", "Down", "Dirty"];
const LEFT_TEXT =
  "Target player discards two cards.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Return target card from your graveyard to your hand.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; down.ts, dirty.ts).
export default defineCard({
  name: "Down // Dirty",
  manaCost: "{3}{B}{2}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
