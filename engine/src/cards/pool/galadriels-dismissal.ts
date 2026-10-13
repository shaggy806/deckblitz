import { defineCard } from "../define.js";

// EDHREC rank 1640.
//
// Kicked, the spell has the player target instead of the creature (rules
// 601.2c, 702.33g — Tear Asunder's shape), and every creature that player
// controls as it resolves phases out (rule 702.26b), what's attached to them
// with them, until that player's next untap step.
export default defineCard({
  name: "Galadriel's Dismissal",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Kicker {2}{W} (You may pay an additional {2}{W} as you cast this spell.)\nTarget creature phases out. If this spell was kicked, each creature target player controls phases out instead. (Treat phased-out creatures and anything attached to them as though they don't exist until their controller's next turn.)",
  targets: ["creature"],
  effect: { kind: "phase-out", target: 0 },
  kicker: {
    cost: "{2}{W}",
    targets: ["player"],
    effect: { kind: "phase-out", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
  },
});
