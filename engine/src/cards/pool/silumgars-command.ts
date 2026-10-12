import { defineCard } from "../define.js";

export default defineCard({
  name: "Silumgar's Command",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Choose two —\n• Counter target noncreature spell.\n• Return target permanent to its owner's hand.\n• Target creature gets -3/-3 until end of turn.\n• Destroy target planeswalker.",
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Counter target noncreature spell.",
        targets: ["noncreature-spell"],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Return target permanent to its owner's hand.",
        targets: ["permanent"],
        effect: { kind: "return-to-hand", target: 0 },
      },
      {
        text: "Target creature gets -3/-3 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      },
      {
        text: "Destroy target planeswalker.",
        targets: [{ kind: "permanent", filter: { type: "planeswalker" } }],
        effect: { kind: "destroy", target: 0 },
      },
    ],
  },
});
