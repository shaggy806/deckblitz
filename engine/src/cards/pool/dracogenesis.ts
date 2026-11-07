import { defineCard } from "../define.js";

// EDHREC rank 2200.
//
// Rulings:
//   [2025-04-04] If a spell has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   [2025-04-04] Once you cast Dracogenesis, if it’s your turn, you’ll have priority immediately
//     after it resolves. You can cast another spell before any player can attempt to remove
//     Dracogenesis with spells or abilities.
//   [2025-04-04] If you cast a spell “without paying its mana cost,” you can’t choose to cast it
//     for any alternative costs. You can, however, pay additional costs, such as kicker costs. If
//     the spell has any mandatory additional costs those must be paid to cast the spell.
//   [2025-04-04] You must follow the normal timing permissions and restrictions of each Dragon
//     spell you cast this way.

export default defineCard({
  name: "Dracogenesis",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "You may cast Dragon spells without paying their mana costs.",
  // An alternative cost (rule 118.9) for Dragon spells cast from any zone the
  // caster may cast them from; beside Jodah or the card's own, the caster picks
  // which one (118.9a). X is 0 (107.3b, the first ruling).
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: { mana: "{0}", filter: { subtype: "Dragon" } },
      text: "You may cast Dragon spells without paying their mana costs.",
    },
  ],
});
