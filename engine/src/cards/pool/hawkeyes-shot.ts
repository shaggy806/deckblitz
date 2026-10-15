import { defineCard } from "../define.js";

// EDHREC rank 29368.

export default defineCard({
  name: "Hawkeye's Shot",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if it targets a tapped creature.\nExile target creature.",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", tapped: true }, reduceGeneric: 2 },
  effect: { kind: "exile", target: 0 },
});
