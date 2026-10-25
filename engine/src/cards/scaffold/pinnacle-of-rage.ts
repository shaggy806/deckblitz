import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 30754.
//
// Rulings:
//   [2014-02-01] You must choose two legal targets to cast Pinnacle of Rage.

export default defineCard({
  name: "Pinnacle of Rage",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Pinnacle of Rage deals 3 damage to each of two targets.",
  // TODO(scaffold): ~ deals 3 damage to each of two targets.
});
