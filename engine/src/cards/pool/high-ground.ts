import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 14726.

export default defineCard({
  name: "High Ground",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "Each creature you control can block an additional creature each combat.",
  static: [
    {
      affects: { scope: "creatures-you-control" },
      blockAdditional: 1,
      text: "Each creature you control can block an additional creature each combat.",
    },
  ],
});
