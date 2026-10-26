import { defineCard } from "../define.js";

export default defineCard({
  name: "Mystic Veil",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  flashThenSacrifice: true,
  text: "You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.\nEnchant creature\nEnchanted creature has shroud. (It can't be the target of spells or abilities.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["shroud"],
      text: "Enchanted creature has shroud.",
    },
  ],
});
