import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 19777.

export default defineCard({
  name: "Soulblast",
  manaCost: "{3}{R}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice all creatures you control.\nSoulblast deals damage to any target equal to the total power of the sacrificed creatures.",
  // TODO(scaffold): As an additional cost to cast ~, sacrifice all creatures you control.
  // TODO(scaffold): ~ deals damage to any target equal to the total power of the sacrificed creatures.
});
