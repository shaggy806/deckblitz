import { defineCard } from "../define.js";

// EDHREC rank 24538.

export default defineCard({
  name: "Cavern Lampad",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 2,
  toughness: 2,
  keywords: ["intimidate"],
  bestow: "{5}{B}",
  text: "Bestow {5}{B} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nIntimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\nEnchanted creature gets +2/+2 and has intimidate.",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["intimidate"],
      text: "Enchanted creature gets +2/+2 and has intimidate.",
    },
  ],
});
