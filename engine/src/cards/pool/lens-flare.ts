import { defineCard } from "../define.js";

export default defineCard({
  name: "Lens Flare",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nLens Flare deals 5 damage to target attacking or blocking creature.",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "damage", amount: 5, target: 0 },
});
