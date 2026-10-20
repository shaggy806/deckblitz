import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 30020.
//
// "Enchanted creature gets -3/-0": on an uncrewed Vehicle it changes nothing,
// a noncreature permanent having no power or toughness (rule 208.3).
export default defineCard({
  name: "Mists of Littjara",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature or Vehicle\nEnchanted creature gets -3/-0.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } }],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-3, 0],
      text: "Enchanted creature gets -3/-0.",
    },
  ],
});
