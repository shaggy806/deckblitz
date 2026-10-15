import { defineCard } from "../define.js";

// EDHREC rank 25151. Draconic Lore's conditional self cost reduction.
export default defineCard({
  name: "Truck Toss",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if you control a Vehicle.\nTruck Toss deals 4 damage to any target.",
  selfCostReduction: {
    condition: { kind: "controls", filter: { subtype: "Vehicle" }, atLeast: 1 },
    reduceGeneric: 2,
  },
  targets: ["any-target"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
