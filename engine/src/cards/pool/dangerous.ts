import { defineCard } from "../define.js";

const FACES = ["Armed // Dangerous", "Armed", "Dangerous"];

// The right half of Armed // Dangerous (see armed-dangerous.ts).
export default defineCard({
  name: "Dangerous",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "All creatures able to block target creature this turn do so.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature"],
  effect: { kind: "restrict", target: 0, restrictions: ["must-be-blocked"] },
  faces: FACES,
  split: true,
});
