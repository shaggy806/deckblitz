import { defineCard } from "../define.js";

// The blocker is destroyed first; the attackers it blocked this combat still
// gain trample, reading the combat's blocks rather than the blocker, and stay
// blocked (rule 509.1h), so they assign all their damage to the player
// (702.19d).

export default defineCard({
  name: "Ride Down",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["instant"],
  text: "Destroy target blocking creature. Creatures that were blocked by that creature this combat gain trample until end of turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", blocking: true } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", blockedThisTurn: { relation: "blocked-by", of: 0, thisCombat: true } },
        keyword: "trample",
        duration: "end-of-turn",
      },
    ],
  },
});
