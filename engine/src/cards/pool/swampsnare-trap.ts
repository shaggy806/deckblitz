import { defineCard } from "../define.js";

// EDHREC rank 17073.
//
// Rulings:
//   [2025-10-02] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying, add any cost increases, then apply any cost reductions (such as that of
//     Swampsnare Trap). The mana value of the spell is determined only by its mana cost, no matter
//     what the total cost to cast that spell was.
//
// An Aura spell targets what it will enchant (rule 303.4a), so Ajani's
// Response's `targetCostReduction` reads the enchant target.

const PT_TEXT = "Enchanted creature gets -5/-3.";

export default defineCard({
  name: "Swampsnare Trap",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `This spell costs {1} less to cast if it targets a creature with flying.\nEnchant creature\n${PT_TEXT}`,
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", keyword: "flying" }, reduceGeneric: 1 },
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-5, -3],
      text: PT_TEXT,
    },
  ],
});
