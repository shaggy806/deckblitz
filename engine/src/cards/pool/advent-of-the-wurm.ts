import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 15505.
// Makes Wurm → use "Wurm Token (Trample)".

export default defineCard({
  name: "Advent of the Wurm",
  manaCost: "{1}{G}{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: "Create a 5/5 green Wurm creature token with trample.",
  effect: { kind: "create-token", token: "Wurm Token (Trample)", count: 1 },
});
