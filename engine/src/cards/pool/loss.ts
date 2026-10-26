import { defineCard } from "../define.js";

const FACES = ["Profit // Loss", "Profit", "Loss"];

// The right half of Profit // Loss (see profit-loss.ts).
export default defineCard({
  name: "Loss",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Creatures your opponents control get -1/-1 until end of turn.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "opponent" },
    power: -1,
    toughness: -1,
    duration: "end-of-turn",
  },
  faces: FACES,
  split: true,
});
