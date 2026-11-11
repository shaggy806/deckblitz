import { defineCard } from "../define.js";

// Tiered (rule 702.183a), as Thunder Magic's. Blade Beam's "with different
// controllers" is the group's `differentControllers`.
const CROSS_SLASH = "• Cross-Slash — {0} — Destroy target tapped creature.";
const BLADE_BEAM = "• Blade Beam — {1} — Destroy any number of target tapped creatures with different controllers.";
const OMNISLASH = "• Omnislash — {3}{W} — Destroy all tapped creatures.";

export default defineCard({
  name: "Cloud's Limit Break",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Tiered (Choose one additional cost.)\n${CROSS_SLASH}\n${BLADE_BEAM}\n${OMNISLASH}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: CROSS_SLASH,
        spreeCost: "{0}",
        targets: [{ kind: "permanent", filter: { type: "creature", tapped: true } }],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: BLADE_BEAM,
        spreeCost: "{1}",
        targets: [
          {
            kind: "any-number",
            of: { kind: "permanent", filter: { type: "creature", tapped: true } },
            differentControllers: true,
          },
        ],
        effect: { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      },
      {
        text: OMNISLASH,
        spreeCost: "{3}{W}",
        targets: [],
        effect: { kind: "destroy-all", filter: { type: "creature", tapped: true } },
      },
    ],
  },
});
