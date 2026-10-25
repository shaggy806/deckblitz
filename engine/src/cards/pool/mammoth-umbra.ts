import { defineCard } from "../define.js";

// EDHREC rank 12870.

export default defineCard({
  name: "Mammoth Umbra",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: "Enchant creature\nEnchanted creature gets +3/+3 and has vigilance.\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["vigilance"],
      text: "Enchanted creature gets +3/+3 and has vigilance.",
    },
  ],
});
