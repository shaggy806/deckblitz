import { defineCard } from "../define.js";

export default defineCard({
  name: "Into Thin Air",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["instant"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nReturn target artifact to its owner's hand.",
  targets: ["artifact"],
  effect: { kind: "return-to-hand", target: 0 },
});
