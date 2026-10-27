import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 27035.

export default defineCard({
  name: "Sinister Strength",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +3/+1 and is black.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 1],
      setColors: ["B"],
      text: "Enchanted creature gets +3/+1 and is black.",
    },
  ],
});
