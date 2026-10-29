import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES } from "../helpers.js";

// EDHREC rank 25038.
//
// The choice is asked as it enters (`chooseOnEnter`); "enchanted land is the
// chosen type" sets its land types (rule 305.7 — `setsChosenLandType`), so it
// loses the abilities its rules text gave it. Supertypes (basic, snow) stay.
//
// Rulings:
//   [2006-10-15] Will not add or remove the supertype snow to or from a land.

export default defineCard({
  name: "Phantasmal Terrain",
  manaCost: "{U}{U}",
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
