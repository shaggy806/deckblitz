import { defineCard } from "../define.js";

// EDHREC rank 3925.
//
// A creature and nothing else (setTypes — an Equipment, Vehicle or Cave subtype goes
// with its lost type, rule 205.1a), a Skeleton (setSubtypes), black (setColors), base
// 1/1, with no abilities: one static.
//
// Rulings:
//   [2024-11-08] If the enchanted creature had any subtypes other than creature types, such as
//     Equipment, Vehicle, or Cave, it loses those as well.
//   [2024-11-08] Eaten by Piranhas overwrites all previous effects that set the creature's base
//     power and toughness to specific values. Any power- or toughness-setting effects that start
//     to apply afterward will overwrite this effect.
//   [2024-11-08] Effects that modify the creature's power and/or toughness, such as the effect of
//     Giant Growth, will apply to the creature no matter when they started to take effect.

export default defineCard({
  name: "Eaten by Piranhas",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nEnchant creature\nEnchanted creature loses all abilities and is a black Skeleton creature with base power and toughness 1/1. (It loses all other colors, card types, and creature types.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      loseAllAbilities: true,
      setTypes: ["creature"],
      setSubtypes: ["Skeleton"],
      setColors: ["B"],
      setBasePt: { power: 1, toughness: 1 },
      text: "Enchanted creature loses all abilities and is a black Skeleton creature with base power and toughness 1/1.",
    },
  ],
});
