import { defineCard } from "../define.js";

export default defineCard({
  name: "Fissure Vent",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one or both —\n• Destroy target artifact.\n• Destroy target nonbasic land.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: "Destroy target nonbasic land.",
        targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
