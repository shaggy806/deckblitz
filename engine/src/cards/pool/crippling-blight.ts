import { defineCard } from "../define.js";

export default defineCard({
  name: "Crippling Blight",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets -1/-1 and can't block.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-1, -1],
      restrictions: ["cant-block"],
      text: "Enchanted creature gets -1/-1 and can't block.",
    },
  ],
});
