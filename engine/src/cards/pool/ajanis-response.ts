import { defineCard } from "../define.js";

// EDHREC rank 17478. Magnificent End's cost reduction.

export default defineCard({
  name: "Ajani's Response",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "This spell costs {3} less to cast if it targets a tapped creature.\nDestroy target creature.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", tapped: true }, reduceGeneric: 3 },
  effect: { kind: "destroy", target: 0 },
});
