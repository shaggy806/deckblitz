import { addManaAbility } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 7985.
//
// Imprisoned in the Moon's shape: "is a Treasure artifact" replaces its card
// types (rule 205.1a — a creature stops being one, and its creature types go
// with it) and its artifact types; the mana ability comes from the same static
// as the loss, so it stays (rule 613.7). Name, colours and mana cost stay.
//
// Rulings:
//   [2024-03-08] A creature enchanted with Minimus Containment stops being a creature. Equipment
//     attached to that creature become unattached. Auras attached to that creature will be put
//     into their owner's graveyard (unless they could also enchant a Treasure artifact).
//   [2024-03-08] The enchanted permanent still retains its name, colors, mana cost, and mana value.
//     It isn't a token unless it already was one.

const TREASURE_TEXT =
  'Enchanted permanent is a Treasure artifact with "{T}, Sacrifice this artifact: Add one mana of any color," and it loses all other abilities. (If it was a creature, it\'s no longer a creature.)';

export default defineCard({
  name: "Minimus Containment",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant nonland permanent\n${TREASURE_TEXT}`,
  targets: ["nonland-permanent"],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["artifact"],
      setSubtypes: ["Treasure"],
      loseAllAbilities: true,
      grantsActivated: [
        addManaAbility({
          mana: "any-color",
          sacrifice: "self",
          text: "{T}, Sacrifice this artifact: Add one mana of any color.",
        }),
      ],
      text: TREASURE_TEXT,
    },
  ],
});
