import { defineCard } from "../define.js";

export default defineCard({
  name: "Lofty Dreams",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nEnchant creature\nWhen this Aura enters, draw a card.\nEnchanted creature gets +2/+2 and has flying.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Aura enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +2/+2 and has flying.",
    },
  ],
});
