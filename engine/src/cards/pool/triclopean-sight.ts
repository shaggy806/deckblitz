import { defineCard } from "../define.js";

export default defineCard({
  name: "Triclopean Sight",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nWhen this Aura enters, untap enchanted creature.\nEnchanted creature gets +1/+1 and has vigilance.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: "When this Aura enters, untap enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["vigilance"],
      text: "Enchanted creature gets +1/+1 and has vigilance.",
    },
  ],
});
