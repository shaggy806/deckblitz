import { defineCard } from "../define.js";

// EDHREC rank 11914.

export default defineCard({
  name: "Hypnotic Siren",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Siren"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Bestow {5}{U}{U} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nFlying\nYou control enchanted creature.\nEnchanted creature gets +1/+1 and has flying.",
  bestow: "{5}{U}{U}",
  // "You control enchanted creature" — only while it's a bestowed Aura
  // attached to one (rule 702.103b).
  controlEnchanted: true,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +1/+1 and has flying.",
    },
  ],
});
