import { defineCard } from "../define.js";

// EDHREC rank 18974.

export default defineCard({
  name: "Oxidda Finisher",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Rebel"],
  power: 7,
  toughness: 5,
  keywords: ["trample"],
  // Affinity for Equipment (rule 702.41): {1} less for each Equipment you control.
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { subtype: "Equipment", controlledBy: "you" } },
  },
  text: "Affinity for Equipment (This spell costs {1} less to cast for each Equipment you control.)\nTrample",
});
