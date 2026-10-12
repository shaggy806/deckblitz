import { defineCard } from "../define.js";

export default defineCard({
  name: "Memory Guardian",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Artificer"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying",
});
