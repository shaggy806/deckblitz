import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 16211.

export default defineCard({
  name: "Overwhelming Denial",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  cantBeCountered: true,
  alternativeCost: {
    mana: "{U}{U}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {U}{U} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nThis spell can't be countered.\nCounter target spell.",
  targets: ["spell"],
  effect: { kind: "counter", target: 0 },
});
