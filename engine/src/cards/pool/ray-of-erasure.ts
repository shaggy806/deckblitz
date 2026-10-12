import { defineCard } from "../define.js";

export default defineCard({
  name: "Ray of Erasure",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target player mills a card.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: 0, amount: 1 },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
