import { defineCard } from "../define.js";

// One static (rule 613.7): only a creature and a Citizen (layer 4), green and
// white (5), no abilities (6), base 1/1 (7b), and one name. It stays legendary if
// it was (205.4b): the rule a legend sees then is about this name.
const TEXT =
  "Enchanted creature loses all abilities and is a green and white Citizen creature with base power and toughness 1/1 named Legitimate Businessperson. (It loses all other colors, card types, creature types, and names.)";

export default defineCard({
  name: "Witness Protection",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      setTypes: ["creature"],
      setSubtypes: ["Citizen"],
      setColors: ["G", "W"],
      setBasePt: { power: 1, toughness: 1 },
      setName: "Legitimate Businessperson",
      text: TEXT,
    },
  ],
});
