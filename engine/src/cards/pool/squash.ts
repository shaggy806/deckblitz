import { defineCard } from "../define.js";

export default defineCard({
  name: "Squash",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "This spell costs {3} less to cast if you control a Giant.\nSquash deals 6 damage to target creature or planeswalker.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Giant" }, atLeast: 1 },
    reduceGeneric: 3,
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 6, target: 0 },
});
