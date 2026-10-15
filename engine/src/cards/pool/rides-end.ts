import { defineCard } from "../define.js";

// EDHREC rank 16541.
//
// Ajani's Response's cost reduction: its one target is a creature or Vehicle,
// and the reduction asks only that it be tapped.

export default defineCard({
  name: "Ride's End",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "This spell costs {3} less to cast if it targets a tapped permanent.\nExile target creature or Vehicle.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  targetCostReduction: { filter: { tapped: true }, reduceGeneric: 3 },
  effect: { kind: "exile", target: 0 },
});
