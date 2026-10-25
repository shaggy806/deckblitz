import { defineCard } from "../define.js";

// EDHREC rank 7907. Curator's Ward's "Enchant permanent" grant.

export default defineCard({
  name: "Indestructibility",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant permanent\nEnchanted permanent has indestructible. (Effects that say \"destroy\" don't destroy that permanent. A creature with indestructible can't be destroyed by damage.)",
  targets: ["permanent"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["indestructible"],
      text: "Enchanted permanent has indestructible.",
    },
  ],
});
