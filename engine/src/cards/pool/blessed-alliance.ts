import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 17220. Escalate {2} (rule 702.120a) — `costPerExtraMode`. The
// targeted opponent chooses which attacking creature to sacrifice (the
// ruling); untapping an attacker doesn't remove it from combat.
export default defineCard({
  name: "Blessed Alliance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Escalate {2} (Pay this cost for each mode chosen beyond the first.)\nChoose one or more —\n• Target player gains 4 life.\n• Untap up to two target creatures.\n• Target opponent sacrifices an attacking creature of their choice.",
  castModal: {
    minModes: 1,
    maxModes: 3,
    costPerExtraMode: "{2}",
    modes: [
      {
        text: "Target player gains 4 life.",
        targets: ["player"],
        effect: { kind: "gain-life", amount: 4, toControllerOfTarget: 0 },
      },
      {
        text: "Untap up to two target creatures.",
        targets: distinctTargets(2, "creature", { optional: true }),
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: 0 },
            { kind: "untap", target: 1 },
          ],
        },
      },
      {
        text: "Target opponent sacrifices an attacking creature of their choice.",
        targets: ["opponent"],
        effect: { kind: "sacrifice", who: "target", filter: { type: "creature", attacking: true }, count: 1 },
      },
    ],
  },
});
