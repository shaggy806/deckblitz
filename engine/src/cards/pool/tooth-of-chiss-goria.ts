import { defineCard } from "../define.js";

export default defineCard({
  name: "Tooth of Chiss-Goria",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  keywords: ["flash"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Flash\nAffinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\n{T}: Target creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature gets +1/+0 until end of turn.",
    },
  ],
});
