import { defineCard } from "../define.js";

// EDHREC rank 21224.
//
// Rulings:
//   It can't reduce the colored mana requirements of spells you cast.
//   It looks only at the mana value of a spell, not the cost you're paying for it. An {X} in
//   the mana cost counts at its chosen value.

export default defineCard({
  name: "Spectacle Mage",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Bird", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nInstant and sorcery spells you cast with mana value 5 or greater cost {1} less to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { typesAnyOf: ["instant", "sorcery"], manaValue: { op: "gte", n: 5 } },
        caster: "you",
        reduceGeneric: 1,
      },
      text: "Instant and sorcery spells you cast with mana value 5 or greater cost {1} less to cast.",
    },
  ],
});
