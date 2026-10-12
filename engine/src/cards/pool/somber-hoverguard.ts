import { defineCard } from "../define.js";

export default defineCard({
  name: "Somber Hoverguard",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drone"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying",
});
