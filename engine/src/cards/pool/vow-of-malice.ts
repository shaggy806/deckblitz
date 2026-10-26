import { defineCard } from "../define.js";

// EDHREC rank 9250. Vow of Duty's shape.
const TEXT =
  "Enchanted creature gets +2/+2, has intimidate, and can't attack you or planeswalkers you control. " +
  "(A creature with intimidate can't be blocked except by artifact creatures and/or creatures that share a color with it.)";

export default defineCard({
  name: "Vow of Malice",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["intimidate"],
      cantAttackController: true,
      text: TEXT,
    },
  ],
});
