import { defineCard } from "../define.js";

export default defineCard({
  name: "Brush Off",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  targetCostReduction: {
    filter: { typesAnyOf: ["instant", "sorcery"] },
    reduceGeneric: 1,
    reduceColored: "{U}",
  },
  text: "This spell costs {1}{U} less to cast if it targets an instant or sorcery spell.\nCounter target spell.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
