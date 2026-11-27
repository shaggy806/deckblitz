import { defineCard } from "../define.js";

// Visions. EDHREC rank 27563.
//
// Both halves at once (`phasing-swap`, rule 702.26a): a creature phasing in
// now doesn't phase out again, and one phasing out now doesn't come back.

export default defineCard({
  name: "Time and Tide",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Simultaneously, all phased-out creatures phase in and all creatures with phasing phase out.",
  effect: { kind: "phasing-swap", filter: { type: "creature" } },
});
