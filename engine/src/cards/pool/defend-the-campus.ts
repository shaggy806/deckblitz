import { defineCard } from "../define.js";

export default defineCard({
  name: "Defend the Campus",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Choose one —\n• Creatures you control get +1/+1 until end of turn.\n• Destroy target creature with power 4 or greater.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Creatures you control get +1/+1 until end of turn.",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 1,
          toughness: 1,
          duration: "end-of-turn",
        },
      },
      {
        text: "Destroy target creature with power 4 or greater.",
        targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "gte", n: 4 } } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
