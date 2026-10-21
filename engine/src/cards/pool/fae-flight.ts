import { defineCard } from "../define.js";

export default defineCard({
  name: "Fae Flight",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nWhen this Aura enters, enchanted creature gains hexproof until end of turn.\nEnchanted creature gets +1/+0 and has flying.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "attached",
        keyword: "hexproof",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this Aura enters, enchanted creature gains hexproof until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +1/+0 and has flying.",
    },
  ],
});
