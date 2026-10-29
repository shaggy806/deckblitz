import { defineCard } from "../define.js";

// Rule 305.7 (the rulings): the enchanted permanent loses its other card
// types, subtypes and colors and every ability its rules text gave it — not
// ones other effects granted — and has a Forest's intrinsic "{T}: Add {G}".
// Its supertypes and name stay. An Aura or Equipment it was falls off (704.5p).
export default defineCard({
  name: "Song of the Dryads",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant permanent\nEnchanted permanent is a colorless Forest land.",
  targets: ["permanent"],
  static: [
    {
      affects: { scope: "attached" },
      setTypes: ["land"],
      setSubtypes: ["Forest"],
      setColors: [],
      text: "Enchanted permanent is a colorless Forest land.",
    },
  ],
});
