import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 30178.

export default defineCard({
  name: "Mounted Archers",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Archer"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\n{W}: This creature can block an additional creature this turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "block-additional", target: "source", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{W}: This creature can block an additional creature this turn.",
    },
  ],
});
