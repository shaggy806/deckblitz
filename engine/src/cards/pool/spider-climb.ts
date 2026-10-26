import { defineCard } from "../define.js";

export default defineCard({
  name: "Spider Climb",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  flashThenSacrifice: true,
  text: "You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.\nEnchant creature\nEnchanted creature gets +0/+3 and has reach. (It can block creatures with flying.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 3],
      grantKeywords: ["reach"],
      text: "Enchanted creature gets +0/+3 and has reach.",
    },
  ],
});
