import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 27264.

export default defineCard({
  name: "Energy Bolt",
  manaCost: "{X}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Choose one —\n• Energy Bolt deals X damage to target player or planeswalker.\n• Target player gains X life.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        targets: ["player-or-planeswalker"],
        effect: { kind: "damage", amount: "x", target: 0 },
        text: "Energy Bolt deals X damage to target player or planeswalker.",
      },
      {
        targets: ["player"],
        effect: { kind: "gain-life", amount: "x", toControllerOfTarget: 0 },
        text: "Target player gains X life.",
      },
    ],
  },
});
