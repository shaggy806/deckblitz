import { defineCard } from "../define.js";

const FACES = ["Far // Away", "Far", "Away"];

// The right half of Far // Away (see far-away.ts).
export default defineCard({
  name: "Away",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target player sacrifices a creature of their choice.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["player"],
  effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
  faces: FACES,
  split: true,
});
