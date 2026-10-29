import { defineCard } from "../define.js";

// Rule 305.7: the enchanted land loses its other land types and its
// rules-text abilities, and has "{T}: Add {U}".
export default defineCard({
  name: "Sea's Claim",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land (Target a land as you cast this. This card enters attached to that land.)\nEnchanted land is an Island.",
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      setSubtypes: ["Island"],
      text: "Enchanted land is an Island.",
    },
  ],
});
