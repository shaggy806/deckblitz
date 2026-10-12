import { defineCard } from "../define.js";

export default defineCard({
  name: "Crosis's Charm",
  manaCost: "{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["instant"],
  text: "Choose one —\n• Return target permanent to its owner's hand.\n• Destroy target nonblack creature. It can't be regenerated.\n• Destroy target artifact.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Return target permanent to its owner's hand.",
        targets: ["permanent"],
        effect: { kind: "return-to-hand", target: 0 },
      },
      {
        text: "Destroy target nonblack creature. It can't be regenerated.",
        targets: ["nonblack-creature"],
        effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      },
      {
        text: "Destroy target artifact.",
        targets: ["artifact"],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
