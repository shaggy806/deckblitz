import { defineCard } from "../define.js";

// EDHREC rank 14377. Rulings (2020-01-24): just a blue Fish — every colour and
// creature type replaced, but its other card types (an enchantment's) kept, so
// only its creature types are set (setSubtypes).

const STATIC_TEXT = "Enchanted creature loses all abilities and is a blue Fish with base power and toughness 0/1.";

export default defineCard({
  name: "Ichthyomorphosis",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      setSubtypes: ["Fish"],
      setColors: ["U"],
      setBasePt: { power: 0, toughness: 1 },
      text: STATIC_TEXT,
    },
  ],
});
