import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 26194.

export default defineCard({
  name: "Lady Zhurong, Warrior Queen",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["horsemanship"],
  text: "Horsemanship (This creature can't be blocked except by creatures with horsemanship.)",
});
