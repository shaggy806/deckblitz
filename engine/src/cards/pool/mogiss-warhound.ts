import { defineCard } from "../define.js";

// EDHREC rank 23200.

export default defineCard({
  name: "Mogis's Warhound",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment", "creature"],
  subtypes: ["Dog"],
  power: 2,
  toughness: 2,
  text: "Bestow {2}{R} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nThis creature attacks each combat if able.\nEnchanted creature gets +2/+2 and attacks each combat if able.",
  bestow: "{2}{R}",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      restrictions: ["must-attack"],
      text: "Enchanted creature gets +2/+2 and attacks each combat if able.",
    },
  ],
});
