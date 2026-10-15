import { defineCard } from "../define.js";

// EDHREC rank 20650.

export default defineCard({
  name: "Magnificent End",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "This spell costs {3} less to cast if it targets a tapped creature.\nMagnificent End deals 5 damage to target creature.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", tapped: true }, reduceGeneric: 3 },
  effect: { kind: "damage", amount: 5, target: 0 },
});
