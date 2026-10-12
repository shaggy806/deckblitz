import { defineCard } from "../define.js";

export default defineCard({
  name: "Crushing Vines",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Destroy target creature with flying.\n• Destroy target artifact.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Destroy target creature with flying.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
