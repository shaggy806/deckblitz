import { defineCard } from "../define.js";

export default defineCard({
  name: "Slag Strider",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 3,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "artifact", controlledBy: "you" } },
  },
  text: "Affinity for artifacts (This spell costs {1} less to cast for each artifact you control.)\n{1}, Sacrifice an artifact: This creature deals 1 damage to any target.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{1}, Sacrifice an artifact: This creature deals 1 damage to any target.",
    },
  ],
});
