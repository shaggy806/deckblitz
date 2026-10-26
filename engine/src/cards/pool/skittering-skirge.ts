import { defineCard } from "../define.js";

// EDHREC rank 31349.
//
// Rulings:
//   The triggered ability triggers when the creature spell is cast, and it is put on the stack
//     before any responses can be cast or activated. This ability will resolve before that
//     creature enters.
//   A "creature spell" is any spell with the type Creature, even if it has other types such as
//     Artifact or Enchantment.
const TEXT = "When you cast a creature spell, sacrifice this creature.";

export default defineCard({
  name: "Skittering Skirge",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Imp"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
