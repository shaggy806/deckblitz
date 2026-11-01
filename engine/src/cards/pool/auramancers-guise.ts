import { defineCard } from "../define.js";

export default defineCard({
  name: "Auramancer's Guise",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2 for each Aura attached to it and has vigilance.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Aura", attachedTo: { isSource: true } }, relativeToAffected: true, pt: [2, 2] },
      grantKeywords: ["vigilance"],
      text: "Enchanted creature gets +2/+2 for each Aura attached to it and has vigilance.",
    },
  ],
});
