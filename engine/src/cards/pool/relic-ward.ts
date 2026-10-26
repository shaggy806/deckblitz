import { defineCard } from "../define.js";

export default defineCard({
  name: "Relic Ward",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  flashThenSacrifice: true,
  text: "You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.\nEnchant artifact\nEnchanted artifact has shroud. (It can't be the target of spells or abilities.)",
  targets: ["artifact"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["shroud"],
      text: "Enchanted artifact has shroud.",
    },
  ],
});
