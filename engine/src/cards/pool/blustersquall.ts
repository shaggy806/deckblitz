import { defineCard } from "../define.js";

// EDHREC rank 6759. Electrickery's overload shape: the overloaded spell taps
// each creature you don't control and targets nothing (rule 702.96a).
export default defineCard({
  name: "Blustersquall",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Tap target creature you don't control.\n" +
    "Overload {3}{U} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  targets: ["creature-an-opponent-controls"],
  effect: { kind: "tap", target: 0 },
  overload: {
    cost: "{3}{U}",
    effect: { kind: "tap-all", filter: { type: "creature", controlledBy: "opponent" } },
  },
});
