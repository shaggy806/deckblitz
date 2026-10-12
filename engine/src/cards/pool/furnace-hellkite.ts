import { defineCard } from "../define.js";

export default defineCard({
  name: "Furnace Hellkite",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\nFlying\n{R}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
});
