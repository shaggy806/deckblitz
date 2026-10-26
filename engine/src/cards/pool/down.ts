import { defineCard } from "../define.js";

const FACES = ["Down // Dirty", "Down", "Dirty"];

// The left half of Down // Dirty (see down-dirty.ts).
export default defineCard({
  name: "Down",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards two cards.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 2 },
  faces: FACES,
  split: true,
});
