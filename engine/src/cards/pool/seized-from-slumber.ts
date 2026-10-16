import { defineCard } from "../define.js";

// EDHREC rank 13540.
export default defineCard({
  name: "Seized from Slumber",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "This spell costs {3} less to cast if it targets a tapped creature.\nDestroy target creature.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", tapped: true }, reduceGeneric: 3 },
  effect: { kind: "destroy", target: 0 },
});
