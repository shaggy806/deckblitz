import { defineCard } from "../define.js";

// Rulings:
//   [2010-08-15] The ability cares about lands with the land type Swamp, not necessarily lands
//     named Swamp.
//   [2010-08-15] This ability counts the number of Swamps controlled by Quag Sickness’s
//     controller, not the enchanted creature’s controller (in case they’re different players).
//   [2010-08-15] This bonus is not fixed; it changes as the number of Swamps you control changes.

const TEXT = "Enchanted creature gets -1/-1 for each Swamp you control.";

export default defineCard({
  name: "Quag Sickness",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Swamp", controlledBy: "you" }, pt: [-1, -1] },
      text: TEXT,
    },
  ],
});
