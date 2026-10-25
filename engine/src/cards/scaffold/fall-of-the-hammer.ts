import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 10811.
//
// Rulings:
//   [2014-02-01] The amount of damage dealt is based on the first target creature’s power as Fall
//     of the Hammer resolves.
//   [2014-02-01] As Fall of the Hammer tries to resolve, if only one of the targets is legal, Fall
//     of the Hammer will still resolve but will have no effect: If the first target creature is
//     illegal, it can’t deal damage to anything. If the second target creature is illegal, it
//     can’t be dealt damage.

export default defineCard({
  name: "Fall of the Hammer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature you control deals damage equal to its power to another target creature.",
  // TODO(scaffold): Target creature you control deals damage equal to its power to another target creature.
});
