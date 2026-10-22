import { defineCard } from "../define.js";

// EDHREC rank 20198.
//
// Rulings:
//   [2017-09-29] Belligerent Brontodon's ability doesn't actually change any creature's power. It
//     changes only the amount of combat damage it assigns.

const TEXT = "Each creature you control assigns combat damage equal to its toughness rather than its power.";

export default defineCard({
  name: "Belligerent Brontodon",
  manaCost: "{5}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 6,
  text: TEXT,
  static: [{ affects: { scope: "creatures-you-control" }, combatDamageByToughness: "always", text: TEXT }],
});
