import { defineCard } from "../define.js";

export default defineCard({
  name: "Borrowed Grace",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Escalate {1}{W} (Pay this cost for each mode chosen beyond the first.)\nChoose one or both —\n• Creatures you control get +2/+0 until end of turn.\n• Creatures you control get +0/+2 until end of turn.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    costPerExtraMode: "{1}{W}",
    modes: [
      {
        targets: [],
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 2,
          toughness: 0,
          duration: "end-of-turn",
        },
        text: "Creatures you control get +2/+0 until end of turn.",
      },
      {
        targets: [],
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 0,
          toughness: 2,
          duration: "end-of-turn",
        },
        text: "Creatures you control get +0/+2 until end of turn.",
      },
    ],
  },
});
