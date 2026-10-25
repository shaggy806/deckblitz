import { defineCard } from "../define.js";

// EDHREC rank 11369.

export default defineCard({
  name: "Eland Umbra",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["umbra-armor"],
  text: "Enchant creature\nEnchanted creature gets +0/+4.\nUmbra armor (If enchanted creature would be destroyed, instead remove all damage from it and destroy this Aura.)",
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [0, 4], text: "Enchanted creature gets +0/+4." }],
});
