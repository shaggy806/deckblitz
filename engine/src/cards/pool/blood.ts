import { defineCard } from "../define.js";

const FACES = ["Flesh // Blood", "Flesh", "Blood"];

// The right half of Flesh // Blood (see flesh-blood.ts).
export default defineCard({
  name: "Blood",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: "Target creature you control deals damage equal to its power to any target.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["creature-you-control", "any-target"],
  effect: { kind: "damage", amount: { powerOf: 0 }, target: 1, from: { target: 0 } },
  faces: FACES,
  split: true,
});
