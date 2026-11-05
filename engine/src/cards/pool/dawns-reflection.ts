import { defineCard } from "../define.js";

// EDHREC rank 9111.

export default defineCard({
  name: "Dawn's Reflection",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nWhenever enchanted land is tapped for mana, its controller adds an additional two mana in any combination of colors.",
  targets: ["land"],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "attached" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: 2 },
      resolve: null,
      text: "Whenever enchanted land is tapped for mana, its controller adds an additional two mana in any combination of colors.",
    },
  ],
});
