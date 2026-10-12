import { defineCard } from "../define.js";

export default defineCard({
  name: "Dark Favor",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, you lose 1 life.\nEnchanted creature gets +3/+1.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: 1 },
      resolve: null,
      text: "When this Aura enters, you lose 1 life.",
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 1], text: "Enchanted creature gets +3/+1." }],
});
