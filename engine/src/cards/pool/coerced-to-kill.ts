import { defineCard } from "../define.js";

const STATIC_TEXT =
  "Enchanted creature has base power and toughness 1/1, has deathtouch, and is an Assassin in addition to its other types.";

export default defineCard({
  name: "Coerced to Kill",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nYou control enchanted creature.\n${STATIC_TEXT}`,
  targets: ["creature"],
  controlEnchanted: true,
  static: [
    {
      // Layer 7b base P/T: P/T changes and counters still apply on top
      // (the rulings).
      affects: { scope: "attached" },
      setBasePt: { power: 1, toughness: 1 },
      grantKeywords: ["deathtouch"],
      addSubtypes: ["Assassin"],
      text: STATIC_TEXT,
    },
  ],
});
