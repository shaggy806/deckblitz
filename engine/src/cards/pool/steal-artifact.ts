import { defineCard } from "../define.js";

// EDHREC rank 18744.
//
// Rulings:
//   [2004-10-04] Can be used on artifact creatures.

export default defineCard({
  name: "Steal Artifact",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant artifact\nYou control enchanted artifact.",
  targets: ["artifact"],
  controlEnchanted: true,
});
