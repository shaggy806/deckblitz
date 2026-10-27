import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 15906.

export default defineCard({
  name: "Thunderclap",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "You may sacrifice a Mountain rather than pay this spell's mana cost.\nThunderclap deals 3 damage to target creature.",
  targets: ["creature"],
  // TODO(scaffold): You may sacrifice a Mountain rather than pay ~'s mana cost.
  // TODO(scaffold): (parsed "~ deals 3 damage to target creature." as {"kind":"damage","amount":3,"target":0})
});
