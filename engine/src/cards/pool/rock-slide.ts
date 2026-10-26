import { defineCard } from "../define.js";

// EDHREC rank 27702.
//
// Rulings:
//   [2004-10-04] If X is 0, you can't choose any targets.
//
// Fire Covenant's X divided as it's cast, at least 1 to each target (rule
// 601.2d) — so no more targets than X, and none at X = 0.

export default defineCard({
  name: "Rock Slide",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Rock Slide deals X damage divided as you choose among any number of target attacking or blocking creatures without flying.",
  targets: [
    {
      kind: "any-number",
      of: {
        kind: "permanent",
        filter: { type: "creature", notKeyword: "flying", anyOf: [{ attacking: true }, { blocking: true }] },
      },
      max: "x",
    },
  ],
  divided: { total: 0, slot: 0, x: true },
  effect: { kind: "damage-divided", from: 0 },
});
