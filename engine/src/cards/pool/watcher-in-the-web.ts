import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 10429.

export default defineCard({
  name: "Watcher in the Web",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\nThis creature can block an additional seven creatures each combat.",
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: 7,
      text: "This creature can block an additional seven creatures each combat.",
    },
  ],
});
