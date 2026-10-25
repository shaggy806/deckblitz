import { defineCard } from "../define.js";

// EDHREC rank 17490.

export default defineCard({
  name: "Flitterstep Eidolon",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  bestow: "{5}{U}",
  text: "Bestow {5}{U} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nThis creature can't be blocked.\nEnchanted creature gets +1/+1 and can't be blocked.",
  static: [
    { affects: { scope: "self" }, grantKeywords: ["unblockable"], text: "This creature can't be blocked." },
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["unblockable"],
      text: "Enchanted creature gets +1/+1 and can't be blocked.",
    },
  ],
});
