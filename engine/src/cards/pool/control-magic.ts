import { defineCard } from "../define.js";

// EDHREC rank 6999.
//
// Rulings:
//   [2016-06-08] Gaining control of a creature doesn't cause you to gain control of any Auras or
//     Equipment attached to it.

export default defineCard({
  name: "Control Magic",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nYou control enchanted creature.",
  targets: ["creature"],
  // Mind Control's shape: the Aura's controller controls the creature (layer
  // 2), not the Auras or Equipment on it (the ruling).
  controlEnchanted: true,
});
