import { defineCard } from "../define.js";

// EDHREC rank 17062.
//
// Rulings:
//   [2025-07-25] If the target permanent is an illegal target as Radiant Strike tries to resolve,
//     it won’t resolve and none of its effects will happen. You won’t gain life.

export default defineCard({
  name: "Radiant Strike",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target artifact or tapped creature. You gain 3 life.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "artifact" }, { type: "creature", tapped: true }] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: 3 },
    ],
  },
});
