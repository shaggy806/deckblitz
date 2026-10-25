import { defineCard } from "../define.js";

// EDHREC rank 19419.

export default defineCard({
  name: "Gnarled Scarhide",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Minotaur"],
  power: 2,
  toughness: 1,
  text: "Bestow {3}{B} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nThis creature can't block.\nEnchanted creature gets +2/+1 and can't block.",
  bestow: "{3}{B}",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
    {
      affects: { scope: "attached" },
      grantPt: [2, 1],
      restrictions: ["cant-block"],
      text: "Enchanted creature gets +2/+1 and can't block.",
    },
  ],
});
