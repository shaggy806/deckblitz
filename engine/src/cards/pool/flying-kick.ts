import { defineCard } from "../define.js";

const FACES = ["Double Jump // Flying Kick", "Double Jump", "Flying Kick"];

// The right half of Double Jump // Flying Kick (see double-jump-flying-kick.ts).
export default defineCard({
  name: "Flying Kick",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control deals damage equal to its power to target creature an opponent controls.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature-you-control", "creature-an-opponent-controls"],
  effect: { kind: "fight", a: 0, b: 1, oneSided: true },
  faces: FACES,
  split: true,
});
