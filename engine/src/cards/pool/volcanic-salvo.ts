import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] You can't target the same creature or planeswalker twice with Volcanic Salvo.
//   [2020-06-23] The cost reduction applies only to generic mana in the cost of Volcanic Salvo.
//   [2020-06-23] If a creature's power is somehow less than 0, it subtracts from the total power
//     of your other creatures. If the total power of your creatures is 0 or less, the cost
//     remains {10}{R}{R}. (The aggregate sums raw powers; the reduction clamps at 0.)

const CREATURE_OR_PLANESWALKER = {
  kind: "permanent",
  whose: "any",
  filter: { typesAnyOf: ["creature", "planeswalker"] },
} as const;

export default defineCard({
  name: "Volcanic Salvo",
  manaCost: "{10}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "This spell costs {X} less to cast, where X is the total power of creatures you control.\nVolcanic Salvo deals 6 damage to each of up to two target creatures and/or planeswalkers.",
  selfCostReduction: {
    // Unconditional: the same always-true gate Ghalta, Primal Hunger uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: {
      aggregate: "sum",
      of: "power",
      filter: { type: "creature", controlledBy: "you" },
    },
  },
  targets: [
    { kind: "optional", of: CREATURE_OR_PLANESWALKER },
    { kind: "optional", of: { kind: "other", of: CREATURE_OR_PLANESWALKER, than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: 6, target: 0 },
      { kind: "damage", amount: 6, target: 1 },
    ],
  },
});
