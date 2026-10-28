import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 22976.

export default defineCard({
  name: "Anurid Swarmsnapper",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Beast"],
  power: 1,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach (This creature can block creatures with flying.)\n{1}{G}: This creature can block an additional creature this turn.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "block-additional", target: "source", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{G}: This creature can block an additional creature this turn.",
    },
  ],
});
