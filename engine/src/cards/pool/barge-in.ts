import { defineCard } from "../define.js";

// EDHREC rank 12747.
//
// Rulings:
//   [2019-10-04] If the target attacking creature is an illegal target by the time Barge In tries
//     to resolve, the spell won't resolve. Your attacking non-Human creatures won't gain trample.

export default defineCard({
  name: "Barge In",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target attacking creature gets +2/+2 until end of turn. Each attacking non-Human creature gains trample until end of turn.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", attacking: true, notSubtypes: ["Human"] },
        keyword: "trample",
        duration: "end-of-turn",
      },
    ],
  },
});
