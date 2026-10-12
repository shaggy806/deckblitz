import { defineCard } from "../define.js";

export default defineCard({
  name: "Iroas's Blessing",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature you control\nWhen this Aura enters, it deals 4 damage to target creature or planeswalker an opponent controls.\nEnchanted creature gets +1/+1.",
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
        },
      ],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "When this Aura enters, it deals 4 damage to target creature or planeswalker an opponent controls.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." }],
});
