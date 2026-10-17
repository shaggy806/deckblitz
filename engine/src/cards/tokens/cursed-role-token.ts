import { defineCard } from "../define.js";

// Rule 111.10j: a colorless Aura Role enchantment token named Cursed. Its
// base P/T is set in layer 7b, so counters and pumps still apply on top.
export default defineCard({
  name: "Cursed Role Token",
  art: "https://cards.scryfall.io/art_crop/back/a/9/a9b7040e-cd24-42cc-b043-9af8c557da6a.jpg",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Aura", "Role"],
  text: "Enchant creature\nEnchanted creature has base power and toughness 1/1.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      setBasePt: { power: 1, toughness: 1 },
      text: "Enchanted creature has base power and toughness 1/1.",
    },
  ],
});
