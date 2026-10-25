import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 21238.

export default defineCard({
  name: "Lightning Volley",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Until end of turn, creatures you control gain \"{T}: This creature deals 1 damage to any target.\"",
  // TODO(scaffold): Until end of turn, creatures you control gain "{T}: This creature deals 1 damage to any target."
});
