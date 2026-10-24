import { defineCard } from "../define.js";

export default defineCard({
  name: "Vow of Lightning",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +2/+2, has first strike, and can't attack you or planeswalkers you control.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["first-strike"],
      // "You" is the Aura's controller.
      cantAttackController: true,
      text: "Enchanted creature gets +2/+2, has first strike, and can't attack you or planeswalkers you control.",
    },
  ],
});
