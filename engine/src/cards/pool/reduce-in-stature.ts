import { defineCard } from "../define.js";

const BASE_TEXT = "Enchanted creature has base power and toughness 0/2.";

// Layer 7b: modifiers and counters still apply over it (its rulings).
export default defineCard({
  name: "Reduce in Stature",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${BASE_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setBasePt: { power: 0, toughness: 2 },
      text: BASE_TEXT,
    },
  ],
});
