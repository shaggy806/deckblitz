import { defineCard } from "../define.js";

export default defineCard({
  name: "Vow of Wildness",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +3/+3, has trample, and can't attack you or planeswalkers you control.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      grantKeywords: ["trample"],
      // "You" is the Aura's controller (Vow of Duty's shape).
      cantAttackController: true,
      text: "Enchanted creature gets +3/+3, has trample, and can't attack you or planeswalkers you control.",
    },
  ],
});
