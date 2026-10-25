import { defineCard } from "../define.js";

export default defineCard({
  name: "Borrowed Malevolence",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Escalate {2} (Pay this cost for each mode chosen beyond the first.)\nChoose one or both —\n• Target creature gets +1/+1 until end of turn.\n• Target creature gets -1/-1 until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    costPerExtraMode: "{2}",
    modes: [
      {
        text: "Target creature gets +1/+1 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      },
      {
        text: "Target creature gets -1/-1 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      },
    ],
  },
});
