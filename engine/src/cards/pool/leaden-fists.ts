import { defineCard } from "../define.js";

const TEXT = "Enchanted creature gets +3/+3 and doesn't untap during its controller's untap step.";

export default defineCard({
  name: "Leaden Fists",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: `Flash\nEnchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      restrictions: ["doesnt-untap"],
      text: TEXT,
    },
  ],
});
