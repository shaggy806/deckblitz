import { defineCard } from "../define.js";

export default defineCard({
  name: "Galvanic Arc",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, it deals 3 damage to any target.\nEnchanted creature has first strike.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "When this Aura enters, it deals 3 damage to any target.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike"],
      text: "Enchanted creature has first strike.",
    },
  ],
});
