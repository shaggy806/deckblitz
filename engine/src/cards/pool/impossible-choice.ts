import { defineCard } from "../define.js";

// EDHREC rank 28142.

export default defineCard({
  name: "Impossible Choice",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose one —\n• Surgical Separation — Destroy target creature. Its controller creates two 1/1 red Officer creature tokens.\n• Remain Fused — You draw two cards and each player loses 2 life.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Surgical Separation — Destroy target creature. Its controller creates two 1/1 red Officer creature tokens.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            { kind: "create-token", token: "Officer Token", count: 2, who: "target-controller" },
          ],
        },
      },
      {
        text: "Remain Fused — You draw two cards and each player loses 2 life.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 2 },
            { kind: "lose-life", amount: 2, who: "each-player" },
          ],
        },
      },
    ],
  },
});
