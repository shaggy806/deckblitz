import { defineCard } from "../define.js";

export default defineCard({
  name: "Spirit Away",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nYou control enchanted creature.\nEnchanted creature gets +2/+2 and has flying.",
  targets: ["creature"],
  controlEnchanted: true,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +2/+2 and has flying.",
    },
  ],
});
