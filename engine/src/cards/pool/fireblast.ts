import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 17516.

export default defineCard({
  name: "Fireblast",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "land", subtype: "Mountain" }, count: 2, text: "two Mountains" },
  },
  text: "You may sacrifice two Mountains rather than pay this spell's mana cost.\nFireblast deals 4 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
