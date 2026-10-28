import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 23099.

export default defineCard({
  name: "Spike-Tailed Ceratops",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 4,
  toughness: 4,
  text: "This creature can block an additional creature each combat.",
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: 1,
      text: "This creature can block an additional creature each combat.",
    },
  ],
});
