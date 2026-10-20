import { defineCard } from "../define.js";

// EDHREC rank 7702.

const DISTRACT_MODE = "Distract the Guard — Tap target creature.";
const HIDE_MODE =
  "Hide — Target creature you control gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)";

export default defineCard({
  name: "You See a Guard Approach",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose one —\n• ${DISTRACT_MODE}\n• ${HIDE_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DISTRACT_MODE,
        targets: ["creature"],
        effect: { kind: "tap", target: 0 },
      },
      {
        text: HIDE_MODE,
        targets: ["creature-you-control"],
        effect: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      },
    ],
  },
});
