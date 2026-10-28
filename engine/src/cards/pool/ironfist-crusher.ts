import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 27909.

export default defineCard({
  name: "Ironfist Crusher",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  morph: { keyword: "morph", cost: "{3}{W}" },
  text: "This creature can block any number of creatures.\nMorph {3}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: "any",
      text: "This creature can block any number of creatures.",
    },
  ],
});
