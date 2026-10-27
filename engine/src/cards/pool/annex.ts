import { defineCard } from "../define.js";

export default defineCard({
  name: "Annex",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land (Target a land as you cast this. This card enters attached to that land.)\nYou control enchanted land.",
  targets: ["land"],
  controlEnchanted: true,
});
