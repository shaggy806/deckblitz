import { defineCard } from "../define.js";

export default defineCard({
  name: "Ivory Charm",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• All creatures get -2/-0 until end of turn.\n• Tap target creature.\n• Prevent the next 1 damage that would be dealt to any target this turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "All creatures get -2/-0 until end of turn.",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature" },
          power: -2,
          toughness: 0,
          duration: "end-of-turn",
        },
      },
      {
        text: "Tap target creature.",
        targets: ["creature"],
        effect: { kind: "tap", target: 0 },
      },
      {
        text: "Prevent the next 1 damage that would be dealt to any target this turn.",
        targets: ["any-target"],
        effect: { kind: "prevent-damage", target: 0, amount: 1 },
      },
    ],
  },
});
