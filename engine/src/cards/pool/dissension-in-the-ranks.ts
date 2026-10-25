import { defineCard } from "../define.js";

// EDHREC rank 28436. Clash of Titans' two-slot fight, each slot a blocking
// creature (Vanquish's filter).
//
// Rulings:
//   Destroying a blocking creature doesn't cause the attacking creature it blocked to become
//     unblocked.

const BLOCKING = { kind: "permanent", filter: { type: "creature", blocking: true } } as const;

export default defineCard({
  name: "Dissension in the Ranks",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target blocking creature fights another target blocking creature.",
  targets: [BLOCKING, { kind: "other", of: BLOCKING, than: { slot: 0 } }],
  effect: { kind: "fight", a: 0, b: 1 },
});
