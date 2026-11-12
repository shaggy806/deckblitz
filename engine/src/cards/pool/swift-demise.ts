import { defineCard } from "../define.js";

// EDHREC rank 10613. The 1 damage is dealt first, so the target counts if it's
// yours to destroy.

export default defineCard({
  name: "Swift Demise",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Swift Demise deals 1 damage to target creature. Then destroy each creature you don't control that was dealt damage this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "destroy-all", filter: { type: "creature", controlledBy: "opponent", damagedThisTurnBy: {} } },
    ],
  },
});
