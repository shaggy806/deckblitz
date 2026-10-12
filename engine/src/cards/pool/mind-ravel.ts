import { defineCard } from "../define.js";

export default defineCard({
  name: "Mind Ravel",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards a card.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 1 },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
