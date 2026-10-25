import { defineCard } from "../define.js";

// EDHREC rank 16381.

export default defineCard({
  name: "Ghostblade Eidolon",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["double-strike"],
  bestow: "{5}{W}",
  text: "Bestow {5}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nDouble strike (This creature deals both first-strike and regular combat damage.)\nEnchanted creature gets +1/+1 and has double strike.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["double-strike"],
      text: "Enchanted creature gets +1/+1 and has double strike.",
    },
  ],
});
