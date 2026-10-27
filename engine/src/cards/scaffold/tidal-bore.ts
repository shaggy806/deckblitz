import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 14043.

export default defineCard({
  name: "Tidal Bore",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may return an Island you control to its owner's hand rather than pay this spell's mana cost.\nYou may tap or untap target creature.",
  // TODO(scaffold): You may return an Island you control to its owner's hand rather than pay ~'s mana cost.
  // TODO(scaffold): You may tap or untap target creature.
});
