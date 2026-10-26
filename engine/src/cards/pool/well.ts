import { defineCard } from "../define.js";

const FACES = ["Alive // Well", "Alive", "Well"];

// The right half of Alive // Well (see alive-well.ts).
export default defineCard({
  name: "Well",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You gain 2 life for each creature you control.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: {
    kind: "gain-life",
    amount: { product: [2, { countOf: { type: "creature", controlledBy: "you" } }] },
  },
  faces: FACES,
  split: true,
});
