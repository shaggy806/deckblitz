import { defineCard } from "../define.js";

// EDHREC rank 9101. Fallout.
//
// Hulkbuster Armor's shape on an Aura: base power and toughness set in layer
// 7b, so counters and +N/+N effects still apply on top, whenever they began
// (the rulings).
const STATIC_TEXT = "Enchanted creature has base power and toughness 9/10 and has indestructible.";

export default defineCard({
  name: "Almost Perfect",
  manaCost: "{4}{G}{W}",
  colors: ["W", "G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${STATIC_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setBasePt: { power: 9, toughness: 10 },
      grantKeywords: ["indestructible"],
      text: STATIC_TEXT,
    },
  ],
});
