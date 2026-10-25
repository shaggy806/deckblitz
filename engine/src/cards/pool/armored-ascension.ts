import { defineCard } from "../define.js";

// EDHREC rank 7712.
//
// Rulings:
//   This ability counts the number of Plains controlled by Armored Ascension's controller, not
//     the enchanted creature's controller (in case they're different players).
//   This bonus is not fixed; it changes as the number of Plains you control changes.
//   The ability cares about lands with the land type Plains, not necessarily lands named Plains.
//
// Blanchwood Armor's shape: `grantPtPerCount` counts from the Aura's controller's side, live.

export default defineCard({
  name: "Armored Ascension",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature gets +1/+1 for each Plains you control and has flying.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Plains", controlledBy: "you" }, pt: [1, 1] },
      grantKeywords: ["flying"],
      text: "Enchanted creature gets +1/+1 for each Plains you control and has flying.",
    },
  ],
});
