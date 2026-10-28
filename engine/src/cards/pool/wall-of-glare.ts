import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 8140.

export default defineCard({
  name: "Wall of Glare",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 5,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\nThis creature can block any number of creatures.",
  static: [
    {
      affects: { scope: "self" },
      blockAdditional: "any",
      text: "This creature can block any number of creatures.",
    },
  ],
});
