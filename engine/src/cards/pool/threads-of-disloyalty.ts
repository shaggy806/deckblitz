import { defineCard } from "../define.js";

export default defineCard({
  name: "Threads of Disloyalty",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature with mana value 2 or less\nYou control enchanted creature.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } }],
  controlEnchanted: true,
});
