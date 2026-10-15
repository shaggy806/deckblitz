import { defineCard } from "../define.js";

// EDHREC rank 27645.

export default defineCard({
  name: "Wrath of the Bloodmane",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "This spell costs {1} less to cast if you control a legendary creature.\n" +
    "Wrath of the Bloodmane deals 4 damage to target creature or planeswalker.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { type: "creature", supertype: "legendary" }, atLeast: 1 },
    reduceGeneric: 1,
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 4, target: 0 },
});
