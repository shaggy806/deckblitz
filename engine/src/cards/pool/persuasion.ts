import { defineCard } from "../define.js";

// EDHREC rank 21552.

export default defineCard({
  name: "Persuasion",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature (Target a creature as you cast this. This card enters attached to that creature.)\nYou control enchanted creature.",
  targets: ["creature"],
  // Control Magic's shape.
  controlEnchanted: true,
});
