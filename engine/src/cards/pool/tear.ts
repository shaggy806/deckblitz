import { defineCard } from "../define.js";

const FACES = ["Wear // Tear", "Wear", "Tear"];

// The right half of Wear // Tear (see wear-tear.ts).
export default defineCard({
  name: "Tear",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target enchantment.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["enchantment"],
  effect: { kind: "destroy", target: 0 },
  faces: FACES,
  split: true,
});
