import { defineCard } from "../define.js";

// EDHREC rank 2732.

export default defineCard({
  name: "Hyena Umbra",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: "Enchant creature\nEnchanted creature gets +1/+1 and has first strike.\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["first-strike"],
      text: "Enchanted creature gets +1/+1 and has first strike.",
    },
  ],
});
