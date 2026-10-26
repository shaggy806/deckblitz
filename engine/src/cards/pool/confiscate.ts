import { defineCard } from "../define.js";

// EDHREC rank 10824.
//
// Rulings:
//   [2022-12-08] Gaining control of an Aura or Equipment doesn't change what it's attached to.
//   [2022-12-08] Gaining control of a permanent doesn't cause you to gain control of any Auras or
//     Equipment attached to it.

export default defineCard({
  name: "Confiscate",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant permanent\nYou control enchanted permanent.",
  targets: ["permanent"],
  controlEnchanted: true,
});
