import { defineCard } from "../define.js";

// EDHREC rank 20193.
//
// Rulings:
//   A creature with no color does not gain any Protection ability.
//
// `protection.ownColors`: each creature's protection is from the colours it
// is now (layer 5, read in layer 6), so a colourless one has none and one that
// changes colour changes what it's protected from.

const TEXT = "Each creature has protection from each of its colors.";

export default defineCard({
  name: "Earnest Fellowship",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "all-creatures" },
      protection: { ownColors: true },
      text: TEXT,
    },
  ],
});
