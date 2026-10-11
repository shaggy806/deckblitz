import { defineCard } from "../define.js";

export default defineCard({
  name: "Panther Robot",
  manaCost: "{10}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Cat", "Robot"],
  power: 8,
  toughness: 8,
  keywords: ["reach", "trample"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nReach, trample",
});
