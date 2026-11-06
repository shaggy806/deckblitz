import { defineCard } from "../define.js";

// EDHREC rank 31094.

const USE_TEXT = "Use the Relic — Target creature gets +3/+2 until end of turn.";
const DESTROY_TEXT = "Destroy the Relic — Destroy target artifact.";

export default defineCard({
  name: "Perils of the Past",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `Choose one —\n• ${USE_TEXT}\n• ${DESTROY_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: USE_TEXT,
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 3, toughness: 2, duration: "end-of-turn" },
      },
      { text: DESTROY_TEXT, targets: ["artifact"], effect: { kind: "destroy", target: 0 } },
    ],
  },
});
