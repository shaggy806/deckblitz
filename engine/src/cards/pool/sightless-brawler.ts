import { defineCard } from "../define.js";

// EDHREC rank 27815.

export default defineCard({
  name: "Sightless Brawler",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  bestow: "{4}{W}",
  text: "Bestow {4}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nThis creature can't attack alone.\nEnchanted creature gets +3/+2 and can't attack alone.",
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-attack-alone"],
      text: "This creature can't attack alone.",
    },
    {
      affects: { scope: "attached" },
      grantPt: [3, 2],
      restrictions: ["cant-attack-alone"],
      text: "Enchanted creature gets +3/+2 and can't attack alone.",
    },
  ],
});
