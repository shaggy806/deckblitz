import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 23821.
//
// Rulings:
//   [2005-06-01] You choose how the damage will be divided among the target creatures at the
//     time you cast Hail of Arrows. Each target must be dealt at least 1 damage. If any of those
//     creatures becomes an illegal target before Hail of Arrows resolves, the division of damage
//     among the remaining creatures doesn't change.
//
// Rolling Thunder's shape, the group narrowed to attacking creatures: X divided as it's cast, at
// least 1 to each target (rule 601.2d), so no more targets than X.

export default defineCard({
  name: "Hail of Arrows",
  manaCost: "{X}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Hail of Arrows deals X damage divided as you choose among any number of target attacking creatures.",
  targets: [
    { kind: "any-number", of: { kind: "permanent", filter: { type: "creature", attacking: true } }, max: "x" },
  ],
  divided: { total: 0, slot: 0, x: true },
  effect: { kind: "damage-divided", from: 0 },
});
