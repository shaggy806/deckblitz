import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 18720.

export default defineCard({
  name: "Ghastbark Twins",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: "Trample (This creature can deal excess combat damage to the player or planeswalker it's attacking.)\nThis creature can block an additional creature each combat.",
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: 1,
      text: "This creature can block an additional creature each combat.",
    },
  ],
});
