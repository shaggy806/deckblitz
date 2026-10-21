import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 21422.
//
// Rulings:
//   Only reduces the generic mana portion of a spell's cost. Works on all spells with the type
//   Creature, even if the spell has another type like Artifact or Enchantment.

const TEXT = "Creature spells you cast cost {2} less to cast.";

export default defineCard({
  name: "Planar Gate",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { type: "creature" }, caster: "you", reduceGeneric: 2 },
      text: TEXT,
    },
  ],
});
