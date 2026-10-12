import { defineCard } from "../define.js";

export default defineCard({
  name: "Steelfin Whale",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Whale"],
  power: 3,
  toughness: 4,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nWhenever an artifact you control enters, untap this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever an artifact you control enters, untap this creature.",
    },
  ],
});
