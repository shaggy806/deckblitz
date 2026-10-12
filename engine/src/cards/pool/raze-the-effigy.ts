import { defineCard } from "../define.js";

export default defineCard({
  name: "Raze the Effigy",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target artifact.\n• Target attacking creature gets +2/+2 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Target attacking creature gets +2/+2 until end of turn.",
        targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
        effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      },
    ],
  },
});
