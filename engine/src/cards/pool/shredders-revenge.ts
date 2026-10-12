import { defineCard } from "../define.js";

// EDHREC rank 15317.

export default defineCard({
  name: "Shredder's Revenge",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Choose one —\n• Target player discards two cards.\n• Target player draws two cards and loses 2 life.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target player discards two cards.",
        targets: ["player"],
        effect: { kind: "discard", target: 0, amount: 2 },
      },
      {
        text: "Target player draws two cards and loses 2 life.",
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 2, target: 0 },
            { kind: "lose-life", amount: 2, target: 0 },
          ],
        },
      },
    ],
  },
});
