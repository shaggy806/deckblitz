import { defineCard } from "../define.js";

// EDHREC rank 1802.
//
// A granted `blockAdditional`, an ability like the vigilance beside it.
//
// Rulings:
//   [2014-09-20] The last ability is cumulative. If you control an additional Brave the Sands,
//     your creatures will each be able to block three creatures, and so on.

export default defineCard({
  name: "Brave the Sands",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Creatures you control have vigilance.\nEach creature you control can block an additional creature each combat.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantKeywords: ["vigilance"],
      text: "Creatures you control have vigilance.",
    },
    {
      affects: { scope: "creatures-you-control" },
      blockAdditional: 1,
      text: "Each creature you control can block an additional creature each combat.",
    },
  ],
});
