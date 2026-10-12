import { defineCard } from "../define.js";

export default defineCard({
  name: "Plated Onslaught",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nCreatures you control get +2/+1 until end of turn.",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 2,
    toughness: 1,
    duration: "end-of-turn",
  },
});
