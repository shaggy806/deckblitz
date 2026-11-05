import { defineCard } from "../define.js";

// EDHREC rank 27650.

export default defineCard({
  name: "Spirespine",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 1,
  bestow: "{4}{G}",
  text: "Bestow {4}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nThis creature blocks each combat if able.\nEnchanted creature gets +4/+1 and blocks each combat if able.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-block"],
      text: "This creature blocks each combat if able.",
    },
    {
      affects: { scope: "attached" },
      grantPt: [4, 1],
      restrictions: ["must-block"],
      text: "Enchanted creature gets +4/+1 and blocks each combat if able.",
    },
  ],
});
