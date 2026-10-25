import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 28922.
//
// Rulings:
//   [2014-02-01] If the target creature is a Cyclops, it will get -1/-1 before it’s destroyed.

export default defineCard({
  name: "Eye Gouge",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -1/-1 until end of turn. If it's a Cyclops, destroy it.",
  targets: ["creature"],
  // TODO(scaffold): If it's a Cyclops, destroy it.
  // TODO(scaffold): (parsed "Target creature gets -1/-1 until end of turn." as {"kind":"modify-pt","target":0,"power":-1,"toughness":-1,"duration":"end-of-turn"})
});
