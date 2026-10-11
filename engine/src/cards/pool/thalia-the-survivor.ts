import { defineCard } from "../define.js";

// EDHREC rank 19620. Reality Fracture.
//
// Rulings:
//   [2026-08-21] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying, add any cost increases, then apply any cost reductions. The mana value
//     of the spell remains unchanged, no matter what the total cost to cast it was.

const TAX_TEXT = "Noncreature spells your opponents cast cost {1} more to cast.";

export default defineCard({
  name: "Thalia, the Survivor",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${TAX_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { notTypes: ["creature"] }, caster: "opponent", increaseGeneric: 1 },
      text: TAX_TEXT,
    },
  ],
});
