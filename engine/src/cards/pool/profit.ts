import { defineCard } from "../define.js";

const FACES = ["Profit // Loss", "Profit", "Loss"];

// The left half of Profit // Loss (see profit-loss.ts).
export default defineCard({
  name: "Profit",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +1/+1 until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 1,
    toughness: 1,
    duration: "end-of-turn",
  },
  faces: FACES,
  split: true,
});
