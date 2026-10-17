import { defineCard } from "../define.js";

// EDHREC rank 10573.
//
// "A creature that was dealt damage this turn" is `damagedThisTurnBy: {}` —
// damage from any source (Rooftop Assassin's shape); the reduction is Ajani's
// Response's `targetCostReduction`, read off the target chosen.

export default defineCard({
  name: "Bitter Downfall",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "This spell costs {3} less to cast if it targets a creature that was dealt damage this turn.\nDestroy target creature. Its controller loses 2 life.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", damagedThisTurnBy: {} }, reduceGeneric: 3 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "lose-life", amount: 2, toControllerOfTarget: 0 },
    ],
  },
});
