import { defineCard } from "../define.js";

// Rulings:
//   [2008-10-01] "Can only attack alone" means the enchanted creature can't be declared as an
//     attacker during the declare attackers step unless no other creatures are declared as attackers
//     at that time.
//   [2008-10-01] If the enchanted creature attacks alone, then a spell or ability causes another
//     creature to be put onto the battlefield attacking, that's fine.

const TEXT = "Enchanted creature gets +3/+0 and can only attack alone.";

export default defineCard({
  name: "Errantry",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 0], restrictions: ["can-only-attack-alone"], text: TEXT }],
});
