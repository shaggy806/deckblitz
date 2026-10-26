import { defineCard } from "../define.js";

// EDHREC rank 27574.

// Healing Salve, in green.
export default defineCard({
  name: "Healing Leaves",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Target player gains 3 life.\n• Prevent the next 3 damage that would be dealt to any target this turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target player gains 3 life.",
        targets: ["player"],
        effect: { kind: "gain-life", amount: 3, toControllerOfTarget: 0 },
      },
      {
        text: "Prevent the next 3 damage that would be dealt to any target this turn.",
        targets: ["any-target"],
        effect: { kind: "prevent-damage", target: 0, amount: 3 },
      },
    ],
  },
});
