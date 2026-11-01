import { defineCard } from "../define.js";

// EDHREC rank 8767.
export default defineCard({
  name: "Alpha Status",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2 for each other creature on the battlefield that shares a creature type with it.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        filter: { type: "creature" },
        sharesCreatureTypeWithAffected: true,
        relativeToAffected: true,
        excludeSelf: true,
        pt: [2, 2],
      },
      text: "Enchanted creature gets +2/+2 for each other creature on the battlefield that shares a creature type with it.",
    },
  ],
});
