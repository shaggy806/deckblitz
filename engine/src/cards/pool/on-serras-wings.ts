import { defineCard } from "../define.js";

// Being legendary subjects the enchanted creature to the legend rule, by its
// own name (rule 704.5j), and the Aura is legendary as well (the rulings).

const TEXT = "Enchanted creature is legendary, gets +1/+1, and has flying, vigilance, and lifelink.";

export default defineCard({
  name: "On Serra's Wings",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      addSupertypes: ["legendary"],
      grantPt: [1, 1],
      grantKeywords: ["flying", "vigilance", "lifelink"],
      text: TEXT,
    },
  ],
});
