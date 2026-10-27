import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 27023. Stratus Walk's statics.

export default defineCard({
  name: "Air Bladder",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has flying.\nEnchanted creature can block only creatures with flying.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
    {
      affects: { scope: "attached" },
      canBlockOnly: { keyword: "flying" },
      text: "Enchanted creature can block only creatures with flying.",
    },
  ],
});
