import { defineCard } from "../define.js";

// EDHREC rank 18235.
//
// The cost reduction is Betor, Kin to All's total-toughness aggregate as a
// `selfCostReduction` condition; only the generic part comes off.
//
// Rulings:
//   [2026-03-20] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying, add any cost increases, then apply any cost reductions (such as that of
//     Orysa's first ability). The mana value of the spell is determined by only its mana cost, no
//     matter what the total cost to cast that spell was.
//   [2026-03-20] The first step of casting a spell is to move it to the stack. If this causes the
//     total toughness of creatures you control to change (perhaps because you control a creature
//     whose toughness is determined by the number of cards in your hand), that new toughness will
//     be used to determine whether or not the cost reduction from Orysa's first ability applies.
//   [2026-03-20] Once you determine the cost to cast Orysa, you may activate mana abilities to pay
//     that cost. If the total toughness of creatures you control changes while activating mana
//     abilities, the cost to cast Orysa remains what you previously determined.

export default defineCard({
  name: "Orysa, Tide Choreographer",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Bard"],
  power: 2,
  toughness: 2,
  text: "This spell costs {3} less to cast if creatures you control have total toughness 10 or greater.\nWhen Orysa enters, draw two cards.",
  selfCostReduction: {
    condition: {
      kind: "aggregate",
      value: { aggregate: "sum", of: "toughness", filter: { type: "creature", controlledBy: "you" } },
      compare: { op: "gte", n: 10 },
    },
    reduceGeneric: 3,
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "When Orysa enters, draw two cards.",
    },
  ],
});
