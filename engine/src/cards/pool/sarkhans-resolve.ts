import { defineCard } from "../define.js";

export default defineCard({
  name: "Sarkhan's Resolve",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Target creature gets +3/+3 until end of turn.\n• Destroy target creature with flying.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target creature gets +3/+3 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      },
      {
        text: "Destroy target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
