import { defineCard } from "../define.js";

// Ravnica Allegiance.
export default defineCard({
  name: "Deface",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one —\n• Destroy target artifact.\n• Destroy target creature with defender.",
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
        text: "Destroy target creature with defender.",
        targets: [{ kind: "permanent", filter: { type: "creature", keyword: "defender" } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
