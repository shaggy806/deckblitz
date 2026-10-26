import { defineCard } from "../define.js";

export default defineCard({
  name: "Maniacal Rage",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2 and can't block.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      restrictions: ["cant-block"],
      text: "Enchanted creature gets +2/+2 and can't block.",
    },
  ],
});
