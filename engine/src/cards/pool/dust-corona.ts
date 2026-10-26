import { defineCard } from "../define.js";

// EDHREC rank 18973.
//
// Rulings:
//   - Creatures with the Reach ability (such as Giant Spider) can block this because they don't
//     actually have Flying.

const TEXT = "Enchanted creature gets +2/+0 and can't be blocked by creatures with flying.";

export default defineCard({
  name: "Dust Corona",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      cantBeBlockedBy: { keyword: "flying" },
      text: TEXT,
    },
  ],
});
