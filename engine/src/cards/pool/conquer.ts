import { defineCard } from "../define.js";

// EDHREC rank 26070.

export default defineCard({
  name: "Conquer",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant land\nYou control enchanted land.",
  targets: ["land"],
  controlEnchanted: true,
});
