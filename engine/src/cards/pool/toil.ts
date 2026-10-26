import { defineCard } from "../define.js";

const FACES = ["Toil // Trouble", "Toil", "Trouble"];

// The left half of Toil // Trouble (see toil-trouble.ts).
export default defineCard({
  name: "Toil",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player draws two cards and loses 2 life.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, target: 0 },
      { kind: "lose-life", amount: 2, target: 0 },
    ],
  },
  faces: FACES,
  split: true,
});
