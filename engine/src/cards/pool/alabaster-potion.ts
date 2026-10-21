import { defineCard } from "../define.js";

// EDHREC rank 22478. Healing Salve's shape, with X.

export default defineCard({
  name: "Alabaster Potion",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Target player gains X life.\n• Prevent the next X damage that would be dealt to any target this turn.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        targets: ["player"],
        effect: { kind: "gain-life", amount: "x", toControllerOfTarget: 0 },
        text: "Target player gains X life.",
      },
      {
        targets: ["any-target"],
        effect: { kind: "prevent-damage", target: 0, amount: "x" },
        text: "Prevent the next X damage that would be dealt to any target this turn.",
      },
    ],
  },
});
