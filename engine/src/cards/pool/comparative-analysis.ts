import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 21457.

export default defineCard({
  name: "Comparative Analysis",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  alternativeCost: {
    mana: "{2}{U}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {2}{U} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nTarget player draws two cards.",
  targets: ["player"],
  effect: { kind: "draw", amount: 2, target: 0 },
});
