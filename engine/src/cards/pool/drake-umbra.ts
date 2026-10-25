import { defineCard } from "../define.js";

// EDHREC rank 15035.

export default defineCard({
  name: "Drake Umbra",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: "Enchant creature\nEnchanted creature gets +3/+3 and has flying.\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +3/+3 and has flying.",
    },
  ],
});
