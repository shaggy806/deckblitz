import { defineCard } from "../define.js";

// EDHREC rank 25417.
//
// Rulings:
//   - It applies to creature spells cast for an alternative cost (such as
//     emerge), and to one cast without paying its mana cost.
//   - Cost reductions apply after increases.

export default defineCard({
  name: "Geist-Fueled Scarecrow",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 4,
  toughness: 4,
  text: "Creature spells you cast cost {1} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature" }, caster: "you", increaseGeneric: 1 },
      text: "Creature spells you cast cost {1} more to cast.",
    },
  ],
});
