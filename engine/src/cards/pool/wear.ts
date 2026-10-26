import { defineCard } from "../define.js";

const FACES = ["Wear // Tear", "Wear", "Tear"];

// The left half of Wear // Tear (see wear-tear.ts).
export default defineCard({
  name: "Wear",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Destroy target artifact.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["artifact"],
  effect: { kind: "destroy", target: 0 },
  faces: FACES,
  split: true,
});
