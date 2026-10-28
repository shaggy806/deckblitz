import { defineCard } from "../define.js";

// EDHREC rank 6122. Rulings (2024-06-07): the enchanted creature is just a
// green Elk — supertypes kept, every other card type and subtype (Equipment,
// Vehicle, Urza's) lost (setTypes, rule 205.1a).

const STATIC_TEXT =
  "Enchanted creature loses all abilities and is a green Elk creature with base power and toughness 3/3.";

export default defineCard({
  name: "Trickster's Elk",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Elk"],
  power: 3,
  toughness: 3,
  bestow: "{1}{G}",
  text: `Bestow {1}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\n${STATIC_TEXT}`,
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      setTypes: ["creature"],
      setSubtypes: ["Elk"],
      setColors: ["G"],
      setBasePt: { power: 3, toughness: 3 },
      text: STATIC_TEXT,
    },
  ],
});
