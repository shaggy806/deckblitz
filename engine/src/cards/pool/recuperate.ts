import { defineCard } from "../define.js";

export default defineCard({
  name: "Recuperate",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• You gain 6 life.\n• Prevent the next 6 damage that would be dealt to target creature this turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "You gain 6 life.", effect: { kind: "gain-life", amount: 6 } },
      {
        text: "Prevent the next 6 damage that would be dealt to target creature this turn.",
        targets: ["creature"],
        effect: { kind: "prevent-damage", target: 0, amount: 6 },
      },
    ],
  },
});
