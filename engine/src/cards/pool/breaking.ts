import { defineCard } from "../define.js";

const FACES = ["Breaking // Entering", "Breaking", "Entering"];

// The left half of Breaking // Entering (see breaking-entering.ts).
export default defineCard({
  name: "Breaking",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target player mills eight cards.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["player"],
  effect: { kind: "mill", target: 0, amount: 8 },
  faces: FACES,
  split: true,
});
