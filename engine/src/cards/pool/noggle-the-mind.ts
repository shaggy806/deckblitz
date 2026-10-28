import { defineCard } from "../define.js";

// EDHREC rank 10921.
//
// "Is a colorless Noggle" names no card type, so only its creature types are replaced
// (setSubtypes) and its colours cleared (setColors []); base 1/1, no abilities.
//
// Rulings:
//   [2025-11-17] Noggle the Mind overwrites all previous effects that set the creature's base
//     power and toughness to specific values. Any power- or toughness-setting effects that start
//     to apply afterward will overwrite this effect.

export default defineCard({
  name: "Noggle the Mind",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nEnchanted creature loses all abilities and is a colorless Noggle with base power and toughness 1/1. (It loses all colors and all other creature types.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      setColors: [],
      setSubtypes: ["Noggle"],
      setBasePt: { power: 1, toughness: 1 },
      text: "Enchanted creature loses all abilities and is a colorless Noggle with base power and toughness 1/1.",
    },
  ],
});
