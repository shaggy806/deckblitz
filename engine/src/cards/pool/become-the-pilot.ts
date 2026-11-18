import { defineCard } from "../define.js";

// EDHREC rank 16962.
//
// Rulings:
//   [2023-10-13] Only planeswalker and battle permanents can be attacked. Other permanents, such
//     as creatures, can't be attacked.
//
// The evasion is read as blocks are declared, about what the creature is
// attacking then (rule 509.1b): its owner, or a planeswalker or battle its
// owner controls (`"owner-and-permanents"`). Stolen back by its owner, it's
// attacking someone else and can't be blocked.
const STATIC_TEXT =
  "Enchanted creature gets +2/+2 and can't be blocked unless it's attacking its owner or a permanent its owner controls.";

export default defineCard({
  name: "Become the Pilot",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant noncommander creature\nYou control enchanted creature.\n${STATIC_TEXT}`,
  targets: [{ kind: "permanent", filter: { type: "creature", isCommander: false } }],
  controlEnchanted: true,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      restrictions: [{ kind: "cant-be-blocked", unlessAttacking: "owner-and-permanents" }],
      text: STATIC_TEXT,
    },
  ],
});
