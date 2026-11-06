import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 17059.

export default defineCard({
  name: "Blor the Impervious",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Frog", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["trample", "hexproof", "indestructible"],
  text: "Trample, hexproof, indestructible",
});
