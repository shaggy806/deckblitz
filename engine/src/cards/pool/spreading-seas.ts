import { defineCard } from "../define.js";

// EDHREC rank 11992.

export default defineCard({
  name: "Spreading Seas",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nWhen this Aura enters, draw a card.\nEnchanted land is an Island.",
  targets: ["land"],
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
      setSubtypes: ["Island"],
      text: "Enchanted land is an Island.",
    },
  ],
});
