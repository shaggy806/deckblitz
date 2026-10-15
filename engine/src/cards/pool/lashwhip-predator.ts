import { defineCard } from "../define.js";

// EDHREC rank 19131.
//
// Rulings:
//   [2025-07-25] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you’re paying, add any cost increases, then apply any cost reductions. The mana value
//     of the spell remains unchanged, no matter what the total cost to cast it was.
//
// "Your opponents control three or more creatures" is a total over every
// opponent (Turbulent Crater's `opponents-control-total`).

export default defineCard({
  name: "Lashwhip Predator",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Beast"],
  power: 5,
  toughness: 7,
  keywords: ["reach"],
  text: "This spell costs {2} less to cast if your opponents control three or more creatures.\nReach",
  selfCostReduction: {
    condition: { kind: "opponents-control-total", filter: { type: "creature" }, atLeast: 3 },
    reduceGeneric: 2,
  },
});
