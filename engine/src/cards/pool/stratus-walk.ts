import { defineCard } from "../define.js";

export default defineCard({
  name: "Stratus Walk",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, draw a card.\nEnchanted creature has flying. (It can't be blocked except by creatures with flying or reach.)\nEnchanted creature can block only creatures with flying.",
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
      grantKeywords: ["flying"],
      text: "Enchanted creature has flying.",
    },
    {
      affects: { scope: "attached" },
      canBlockOnly: { keyword: "flying" },
      text: "Enchanted creature can block only creatures with flying.",
    },
  ],
});
