import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. Ajani's Response's `targetCostReduction`,
// exiling instead of destroying.

export default defineCard({
  name: "Quicksand Whirlpool",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "This spell costs {3} less to cast if it targets a tapped creature.\nExile target creature.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", tapped: true }, reduceGeneric: 3 },
  effect: { kind: "exile", target: 0 },
});
