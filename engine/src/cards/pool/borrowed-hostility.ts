import { defineCard } from "../define.js";

// EDHREC rank 13335. Escalate {3} (rule 702.120a) — `costPerExtraMode`, as
// Collective Resistance. Both modes may target the same creature (the ruling).
export default defineCard({
  name: "Borrowed Hostility",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Escalate {3} (Pay this cost for each mode chosen beyond the first.)\nChoose one or both —\n• Target creature gets +3/+0 until end of turn.\n• Target creature gains first strike until end of turn.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    costPerExtraMode: "{3}",
    modes: [
      {
        text: "Target creature gets +3/+0 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
      },
      {
        text: "Target creature gains first strike until end of turn.",
        targets: ["creature"],
        effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      },
    ],
  },
});
