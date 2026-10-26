import { defineCard } from "../define.js";

// EDHREC rank 19636.
//
// Rulings:
//   [2004-10-04] This affects all creatures, not just your own.

export default defineCard({
  name: "Absolute Law",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "All creatures have protection from red.",
  static: [
    {
      affects: { scope: "all-creatures" },
      protection: { colors: ["R"] },
      text: "All creatures have protection from red.",
    },
  ],
});
