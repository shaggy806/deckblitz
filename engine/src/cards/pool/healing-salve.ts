import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 21302.
export default defineCard({
  name: "Healing Salve",
  manaCost: "{W}",
  colors: ["W"],
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
