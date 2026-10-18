import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 11833.

export default defineCard({
  name: "Tyrranax Atrocity",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Dinosaur"],
  power: 4,
  toughness: 4,
  toxic: 3,
  keywords: ["haste"],
  text: "Haste\nToxic 3 (Players dealt combat damage by this creature also get three poison counters.)",
});
