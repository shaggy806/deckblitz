import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 17322.
//
// Rulings:
//   [2014-02-01] If the target creature dies that turn, Searing Blood will deal 3 damage to
//     whoever controls the creature when it dies, who isn't necessarily the player who controlled
//     it when Searing Blood resolved. It doesn't matter what causes the creature to die.

export default defineCard({
  name: "Searing Blood",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Searing Blood deals 2 damage to target creature. When that creature dies this turn, Searing Blood deals 3 damage to the creature's controller.",
  targets: ["creature"],
  // TODO(scaffold): When that creature dies this turn, ~ deals 3 damage to the creature's controller.
  // TODO(scaffold): (parsed "~ deals 2 damage to target creature." as {"kind":"damage","amount":2,"target":0})
});
