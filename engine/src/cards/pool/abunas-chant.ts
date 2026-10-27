import { defineCard } from "../define.js";

// EDHREC rank 22992.

export default defineCard({
  name: "Abuna's Chant",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "{2}", keyword: "entwine" },
  text: "Choose one —\n• You gain 5 life.\n• Prevent the next 5 damage that would be dealt to target creature this turn.\nEntwine {2} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: "You gain 5 life.", effect: { kind: "gain-life", amount: 5 } },
      {
        text: "Prevent the next 5 damage that would be dealt to target creature this turn.",
        targets: ["creature"],
        effect: { kind: "prevent-damage", target: 0, amount: 5 },
      },
    ],
    kickedModes: 2,
  },
});
