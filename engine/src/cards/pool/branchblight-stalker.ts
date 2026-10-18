import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 13325.

export default defineCard({
  name: "Branchblight Stalker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Elf", "Scout"],
  power: 3,
  toughness: 1,
  toxic: 2,
  text: "Toxic 2 (Players dealt combat damage by this creature also get two poison counters.)",
});
