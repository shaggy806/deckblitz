import { defineCard } from "../define.js";

// EDHREC rank 13531.
//
// Rulings:
//   [2024-11-08] Use the sacrificed creature's toughness as it last existed on the battlefield to
//     determine how much life to gain.

export default defineCard({
  name: "Tribute to Hunger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target opponent sacrifices a creature of their choice. You gain life equal to that creature's toughness.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      { kind: "gain-life", amount: { thisWay: "sacrificed", sumOf: "toughness" } },
    ],
  },
});
