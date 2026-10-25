import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 30519.
//
// Rulings:
//   [2014-02-01] Defender only matters when Pillar of War could be declared as an attacking
//     creature. If Pillar of War is already attacking, it becoming not enchanted doesn’t cause it
//     to be removed from combat.

export default defineCard({
  name: "Pillar of War",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: "Defender\nAs long as this creature is enchanted, it can attack as though it didn't have defender.",
  // TODO(scaffold): As long as this creature is enchanted, it can attack as though it didn't have defender.
});
