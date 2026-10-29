import { defineCard } from "../define.js";

// EDHREC rank 24076. Rule 305.7: the enchanted land loses its other land
// types and rules-text abilities and gains "{T}: Add {U}" (as Blood Moon).

export default defineCard({
  name: "Lingering Mirage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  cycling: { cost: "{2}" },
  text: "Enchant land\nEnchanted land is an Island.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["land"],
  static: [
    {
      affects: { scope: "attached" },
      setSubtypes: ["Island"],
      text: "Enchanted land is an Island.",
    },
  ],
});
