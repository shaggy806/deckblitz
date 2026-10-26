import { defineCard } from "../define.js";

export default defineCard({
  name: "Grave Servitude",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  flashThenSacrifice: true,
  text: "You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.\nEnchant creature\nEnchanted creature gets +3/-1 and is black.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, -1],
      setColors: ["B"],
      text: "Enchanted creature gets +3/-1 and is black.",
    },
  ],
});
