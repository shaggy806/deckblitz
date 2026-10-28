import { defineCard } from "../define.js";

// EDHREC rank 23442.
//
// Control Magic's shape (`controlEnchanted`) with Fresh Start's static.
//
// Rulings:
//   [2024-09-20] If the enchanted creature gains an ability after Duskmourn's Domination becomes
//     attached to it, it will keep that ability.

export default defineCard({
  name: "Duskmourn's Domination",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nYou control enchanted creature.\nEnchanted creature gets -3/-0 and loses all abilities.",
  targets: ["creature"],
  controlEnchanted: true,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-3, 0],
      loseAllAbilities: true,
      text: "Enchanted creature gets -3/-0 and loses all abilities.",
    },
  ],
});
