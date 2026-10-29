import { defineCard } from "../define.js";

// EDHREC rank 21833.

export default defineCard({
  name: "Evil Presence",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nEnchanted land is a Swamp.",
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      setSubtypes: ["Swamp"],
      text: "Enchanted land is a Swamp.",
    },
  ],
});
