import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 27943.

export default defineCard({
  name: "Barbarian General",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)",
});
