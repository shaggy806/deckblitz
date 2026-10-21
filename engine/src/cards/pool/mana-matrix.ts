import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 23619.
//
// Rulings:
//   Only works on instants and enchantments. It does not work on sorceries. Only reduces the
//   generic mana portion of a spell's cost.

const TEXT = "Instant and enchantment spells you cast cost {2} less to cast.";

export default defineCard({
  name: "Mana Matrix",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { typesAnyOf: ["instant", "enchantment"] }, caster: "you", reduceGeneric: 2 },
      text: TEXT,
    },
  ],
});
