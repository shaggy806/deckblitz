import { defineCard } from "../define.js";

// EDHREC rank 2271.
//
// Rulings:
//   You must still pay any mandatory additional costs, such as exiling a creature card from your
//     graveyard for Makeshift Mauler.
//   The mana cost and mana value of the spell are unchanged. Rooftop Storm only changes what you pay.
//
// An alternative cost for the Zombie creature spells its controller casts
// (Dracogenesis' shape); beside another alternative cost the caster picks which.

const TEXT = "You may pay {0} rather than pay the mana cost for Zombie creature spells you cast.";

export default defineCard({
  name: "Rooftop Storm",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: { mana: "{0}", filter: { type: "creature", subtype: "Zombie" } },
      text: TEXT,
    },
  ],
});
