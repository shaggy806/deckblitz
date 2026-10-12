import { defineCard } from "../define.js";

export default defineCard({
  name: "Gearseeker Serpent",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 5,
  toughness: 6,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\n{5}{U}: This creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{5}{U}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "unblockable",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{5}{U}: This creature can't be blocked this turn.",
    },
  ],
});
