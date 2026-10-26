import { defineCard } from "../define.js";

// EDHREC rank 10021.
//
// Rulings:
//   [2004-10-04] The swamps are counted on resolution.
//   [2010-08-15] The amount of damage dealt to a creature is not bounded by its toughness, and the
//     amount of damage dealt to a player is not bounded by that player's life total.
//   [2010-08-15] The life you gain is equal to the damage dealt by Corrupt, not necessarily to the
//     number of Swamps you control (if some or all of the damage is prevented, for example).
//   [2013-07-01] Corrupt counts any land you control with the subtype Swamp, not just ones named
//     Swamp.

export default defineCard({
  name: "Corrupt",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Corrupt deals damage to any target equal to the number of Swamps you control. You gain life equal to the damage dealt this way.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", target: 0, amount: { countOf: { subtype: "Swamp", controlledBy: "you" } } },
      { kind: "gain-life", amount: { damageDealtThisWay: true } },
    ],
  },
});
