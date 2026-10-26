import { defineCard } from "../define.js";

const FACES = ["Far // Away", "Far", "Away"];

// The left half of Far // Away (see far-away.ts).
export default defineCard({
  name: "Far",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature"],
  effect: { kind: "return-to-hand", target: 0 },
  faces: FACES,
  split: true,
});
