import { defineCard } from "../define.js";

const FACES = ["Catch // Release", "Catch", "Release"];
const LEFT_TEXT =
  "Gain control of target permanent until end of turn. Untap it. It gains haste until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)";
const RIGHT_TEXT =
  "Each player sacrifices an artifact, a creature, an enchantment, a land, and a planeswalker of their choice.\nFuse (You may cast one or both halves of this card from your hand.)";

// The whole card: every zone but the stack (rule 709.4). With fuse, cast from a
// hand as both halves at once — a fused split spell that follows the left
// half's instructions, then the right's (rule 702.102d; catch.ts, release.ts).
export default defineCard({
  name: "Catch // Release",
  manaCost: "{1}{U}{R}{4}{R}{W}",
  colors: ["W", "U", "R"],
  types: ["sorcery"],
  text: `${LEFT_TEXT}\n//\n${RIGHT_TEXT}`,
  faces: FACES,
  split: true,
  fuse: true,
});
