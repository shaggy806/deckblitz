import { defineCard } from "../define.js";

export default defineCard({
  name: "Armor of Thorns",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  flashThenSacrifice: true,
  text: "You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.\nEnchant nonblack creature\nEnchanted creature gets +2/+2.",
  targets: ["nonblack-creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
});
