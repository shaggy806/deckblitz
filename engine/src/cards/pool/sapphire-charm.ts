import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 15844.
//
// The first mode's delayed draw reads the player the spell targeted (a
// delayed ability chooses no targets of its own — rule 603.7c).

export default defineCard({
  name: "Sapphire Charm",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Target player draws a card at the beginning of the next turn's upkeep.\n• Target creature gains flying until end of turn.\n• Target creature an opponent controls phases out. (While it's phased out, it's treated as though it doesn't exist. It phases in before its controller untaps during their next untap step.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Target player draws a card at the beginning of the next turn's upkeep.",
        targets: ["player"],
        effect: {
          kind: "delayed-trigger",
          at: "next-upkeep",
          text: "That player draws a card.",
          effect: { kind: "draw", amount: 1, target: 0 },
        },
      },
      {
        text: "Target creature gains flying until end of turn.",
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      },
      {
        text: "Target creature an opponent controls phases out.",
        targets: ["creature-an-opponent-controls"],
        effect: { kind: "phase-out", target: 0 },
      },
    ],
  },
});
