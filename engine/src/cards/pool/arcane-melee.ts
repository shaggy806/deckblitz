import { defineCard } from "../define.js";

// EDHREC rank 11629.
//
// Rulings:
//   [2012-05-01] The cost to cast an instant or sorcery spell with one generic mana in its mana
//     cost will be reduced by {1}. For example, an instant spell with a mana cost of {1}{G} would
//     cost {G} to cast.
//   [2012-05-01] Arcane Melee can reduce alternative costs such as miracle costs.
//   [2012-05-01] If there are additional costs to cast a spell, such as a kicker cost or a cost
//     imposed by another effect (such as Thalia, Guardian of Thraben’s ability), apply those
//     increases before applying cost reductions.
//   [2012-05-01] Arcane Melee can’t reduce the colored mana requirement of an instant or sorcery
//     spell.
//
// Every player's instants and sorceries (no `caster`, Helm of Awakening's
// shape), generic only.

const TEXT = "Instant and sorcery spells cost {2} less to cast.";

export default defineCard({
  name: "Arcane Melee",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["instant", "sorcery"] }, reduceGeneric: 2 },
      text: TEXT,
    },
  ],
});
