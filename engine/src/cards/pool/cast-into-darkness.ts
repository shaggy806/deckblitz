import { defineCard } from "../define.js";

export default defineCard({
  name: "Cast into Darkness",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets -2/-0 and can't block.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-2, 0],
      restrictions: ["cant-block"],
      text: "Enchanted creature gets -2/-0 and can't block.",
    },
  ],
});
