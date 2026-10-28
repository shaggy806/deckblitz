import { defineCard } from "../define.js";

// EDHREC rank 586.
//
// One static (rule 613.7): an artifact creature and nothing else (setTypes, layer 4 — a
// Shrine's enchantment subtype goes with the enchantment type, an Equipment stays),
// its creature types replaced by Insect (setSubtypes), base 0/1 (7b), and
// indestructible kept beside the loss of every other ability (layer 6). Colours
// untouched.
//
// Rulings:
//   [2013-10-17] The enchanted creature will be only an artifact and a creature, not any other
//     card types. It will be only an Insect, not any other creature types.
//   [2013-10-17] In some rare cases, the creature may have subtypes other than creature types
//     before becoming enchanted with Darksteel Mutation. If it had any other artifact subtypes
//     (such as Equipment), it will retain those. If it had any subtypes other than artifact types
//     and creature types (such as Shrine), it won't retain those.
//   [2013-10-17] The creature will keep any supertypes it previously had.
//   [2013-10-17] Darksteel Mutation causes the enchanted creature to lose all abilities except
//     indestructible at the time it becomes enchanted. Any abilities the creature gains after that
//     point will work normally.
//   [2013-10-17] Darksteel Mutation doesn't affect the enchanted creature's colors, if any.

export default defineCard({
  name: "Darksteel Mutation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature is an Insect artifact creature with base power and toughness 0/1 and has indestructible, and it loses all other abilities, card types, and creature types.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["artifact", "creature"],
      setSubtypes: ["Insect"],
      setBasePt: { power: 0, toughness: 1 },
      grantKeywords: ["indestructible"],
      loseAllAbilities: true,
      text: "Enchanted creature is an Insect artifact creature with base power and toughness 0/1 and has indestructible, and it loses all other abilities, card types, and creature types.",
    },
  ],
});
