import { defineCard } from "../define.js";

// EDHREC rank 19618.
//
// Rulings:
//   [2016-01-22] The ability to block an additional creature is cumulative. If a creature is
//     enchanted with two Iona's Blessings, it can block three creatures each combat. (The +2/+2 is
//     also cumulative, but you knew that.)

export default defineCard({
  name: "Iona's Blessing",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2, has vigilance, and can block an additional creature each combat.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["vigilance"],
      blockAdditional: 1,
      text: "Enchanted creature gets +2/+2, has vigilance, and can block an additional creature each combat.",
    },
  ],
});
