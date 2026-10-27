import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// Pentavus's Pentavite token.

export default defineCard({
  name: "Pentavite Token",
  art: "b6571af0-80e2-474b-a8b1-d3d90e954d2b",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Pentavite"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
