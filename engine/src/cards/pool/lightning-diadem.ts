import { defineCard } from "../define.js";

export default defineCard({
  name: "Lightning Diadem",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, it deals 2 damage to any target.\nEnchanted creature gets +2/+2.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this Aura enters, it deals 2 damage to any target.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Enchanted creature gets +2/+2." }],
});
