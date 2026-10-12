import { defineCard } from "../define.js";

export default defineCard({
  name: "Utrom Monitor",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Utrom", "Scientist"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying (This creature can't be blocked except by creatures with flying or reach.)",
});
