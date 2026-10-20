import { defineCard } from "../define.js";

// EDHREC rank 9412. Commander Legends (CMR). Vow of Duty's shape, with menace.

const TEXT =
  "Enchanted creature gets +2/+2, has menace, and can't attack you or planeswalkers you control. (It can't be blocked except by two or more creatures.)";

export default defineCard({
  name: "Vow of Torment",
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
      grantKeywords: ["menace"],
      // "You" is the Aura's controller.
      cantAttackController: true,
      text: TEXT,
    },
  ],
});
