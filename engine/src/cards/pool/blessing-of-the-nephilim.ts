import { defineCard } from "../define.js";

// EDHREC rank 17740.

export default defineCard({
  name: "Blessing of the Nephilim",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +1/+1 for each of its colors.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { ofAffected: "colors", pt: [1, 1] },
      text: "Enchanted creature gets +1/+1 for each of its colors.",
    },
  ],
});
