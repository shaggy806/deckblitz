import { defineCard } from "../define.js";

// EDHREC rank 26953.

export default defineCard({
  name: "Spearpoint Oread",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  bestow: "{5}{R}",
  text: "Bestow {5}{R} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nFirst strike\nEnchanted creature gets +2/+2 and has first strike.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["first-strike"],
      text: "Enchanted creature gets +2/+2 and has first strike.",
    },
  ],
});
