import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 24710.
//
// Rulings:
//   [2014-02-01] Whether you control another Minotaur is checked only as you declare blockers. The
//     other Minotaur doesn’t have to block.

export default defineCard({
  name: "Felhide Brawler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Minotaur"],
  power: 2,
  toughness: 2,
  text: "This creature can't block unless you control another Minotaur.",
  // TODO(scaffold): This creature can't block unless you control another Minotaur.
});
