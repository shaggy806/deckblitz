import { defineCard } from "../define.js";

// EDHREC rank 19488.
//
// Rulings:
//   [2013-01-24] If a creature already assigned to block Deathcult Rogue stops being a Rogue, it
//     will continue to block.

const TEXT = "This creature can't be blocked except by Rogues.";

export default defineCard({
  name: "Deathcult Rogue",
  manaCost: "{1}{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, cantBeBlockedBy: { notSubtypes: ["Rogue"] }, text: TEXT }],
});
