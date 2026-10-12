import { defineCard } from "../define.js";

export default defineCard({
  name: "Qumulox",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying",
});
