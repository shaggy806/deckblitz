import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 18948.

export default defineCard({
  name: "Shattering Pulse",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: { cost: "{3}", keyword: "buyback" },
  text: "Buyback {3} (You may pay an additional {3} as you cast this spell. If you do, put this card into your hand as it resolves.)\nDestroy target artifact.",
  targets: ["artifact"],
  effect: { kind: "destroy", target: 0 },
});
