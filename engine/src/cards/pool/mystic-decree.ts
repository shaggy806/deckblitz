import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 25262.
//
// Rulings:
//   [2008-10-01] This has the supertype world. When a world permanent enters, any world permanents
//     that were already on the battlefield are put into their owners' graveyards. This is a
//     state-based action called the "world rule." The new world permanent stays on the
//     battlefield. If two world permanents enter at the same time, they're both put into their
//     owners' graveyards.

export default defineCard({
  name: "Mystic Decree",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: "All creatures lose flying and islandwalk.",
  static: [
    {
      affects: { scope: "all-creatures" },
      loseKeywords: ["flying", "islandwalk"],
      text: "All creatures lose flying and islandwalk.",
    },
  ],
});
