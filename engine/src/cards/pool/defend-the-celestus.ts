import { defineCard } from "../define.js";

// EDHREC rank 20524.
//
// Rulings:
//   [2021-09-24] You decide how to distribute the counters as you cast Defend the Celestus. You
//     must distribute at least one counter to each creature you target.
//   [2021-09-24] If some, but not all, of the target creatures are illegal targets as it
//     resolves, the original distribution of counters remains the same. Counters that were to be
//     put on the now-illegal targets are lost.

export default defineCard({
  name: "Defend the Celestus",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Distribute three +1/+1 counters among one, two, or three target creatures you control.",
  targets: [{ kind: "any-number", of: "creature-you-control", min: 1, max: 3 }],
  divided: { total: 3, slot: 0, of: "+1/+1 counters" },
  effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
});
