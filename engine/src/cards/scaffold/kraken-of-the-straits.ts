import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 14117.
//
// Rulings:
//   [2014-02-01] The number of Islands you control is counted as blockers are declared. Creatures
//     with power less than that number at that time can’t block Kraken of the Straits. Once
//     blockers have been declared, the power of the blocking creatures and the number of Islands
//     you control don’t matter.

export default defineCard({
  name: "Kraken of the Straits",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 6,
  toughness: 6,
  text: "Creatures with power less than the number of Islands you control can't block this creature.",
  // TODO(scaffold): Creatures with power less than the number of Islands you control can't block this creature.
});
