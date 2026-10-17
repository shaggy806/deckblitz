import { defineCard } from "../define.js";

export default defineCard({
  name: "Banish from Edoras",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if it targets a tapped creature.\nExile target creature.",
  targetCostReduction: { filter: { type: "creature", tapped: true }, reduceGeneric: 2 },
  targets: ["creature"],
  effect: { kind: "exile", target: 0 },
});
