import { defineCard } from "../define.js";

// EDHREC rank 11837. Vow of Duty's shape.
const TEXT = "Enchanted creature gets +2/+2, has flying, and can't attack you or planeswalkers you control.";

export default defineCard({
  name: "Vow of Flight",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      cantAttackController: true,
      text: TEXT,
    },
  ],
});
