import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 32677.

export default defineCard({
  name: "Penance Stare",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target attacking creature with mana value 3 or less.",
  targets: [
    {
      kind: "permanent",
      filter: { attacking: true, type: "creature", manaValue: { op: "lte", n: 3 } },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
