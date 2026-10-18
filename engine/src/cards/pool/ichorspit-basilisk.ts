import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 8245.

export default defineCard({
  name: "Ichorspit Basilisk",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Basilisk"],
  power: 1,
  toughness: 3,
  toxic: 1,
  keywords: ["deathtouch"],
  text: "Deathtouch\nToxic 1 (Players dealt combat damage by this creature also get a poison counter.)",
});
