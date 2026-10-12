import { defineCard } from "../define.js";

export default defineCard({
  name: "Cartouche of Zeal",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura", "Cartouche"],
  text: "Enchant creature you control\nWhen this Aura enters, target creature can't block this turn.\nEnchanted creature gets +1/+1 and has haste. (It can attack and {T} no matter when it came under your control.)",
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: "When this Aura enters, target creature can't block this turn.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["haste"],
      text: "Enchanted creature gets +1/+1 and has haste.",
    },
  ],
});
