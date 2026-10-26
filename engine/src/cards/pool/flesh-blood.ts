import { defineCard } from "../define.js";

const FACES = ["Flesh // Blood", "Flesh", "Blood"];
const LEFT_TEXT =
  "Exile target creature card from a graveyard. Put X +1/+1 counters on target creature, where X is the power of the card you exiled.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Target creature you control deals damage equal to its power to any target.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; flesh.ts, blood.ts).
export default defineCard({
  name: "Flesh // Blood",
  manaCost: "{3}{B}{G}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["sorcery"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
