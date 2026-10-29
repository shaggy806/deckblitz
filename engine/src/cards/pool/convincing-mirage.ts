import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES } from "../helpers.js";

// Rule 305.7: the enchanted land loses its other land types and its
// rules-text abilities, and gains the chosen type's mana ability (the ruling).
export default defineCard({
  name: "Convincing Mirage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nAs this Aura enters, choose a basic land type.\nEnchanted land is the chosen type.",
  targets: ["land"],
  chooseOnEnter: BASIC_LAND_TYPE_CHOICES,
  static: [
    {
      affects: { scope: "attached" },
      setsChosenLandType: true,
      text: "Enchanted land is the chosen type.",
    },
  ],
});
