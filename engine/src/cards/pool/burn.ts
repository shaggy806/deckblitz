import { defineCard } from "../define.js";

const FACES = ["Turn // Burn", "Turn", "Burn"];

// The right half of Turn // Burn (see turn-burn.ts).
export default defineCard({
  name: "Burn",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Burn deals 2 damage to any target.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
  faces: FACES,
  split: true,
});
