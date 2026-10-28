import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 30917.

export default defineCard({
  name: "Coastline Chimera",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Chimera"],
  power: 1,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\n{1}{W}: This creature can block an additional creature this turn.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: { kind: "block-additional", target: "source", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}: This creature can block an additional creature this turn.",
    },
  ],
});
