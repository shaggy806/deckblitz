import { defineCard } from "../define.js";

export default defineCard({
  name: "Soar",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  flashThenSacrifice: true,
  text: "You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.\nEnchant creature\nEnchanted creature gets +0/+1 and has flying.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 1],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +0/+1 and has flying.",
    },
  ],
});
