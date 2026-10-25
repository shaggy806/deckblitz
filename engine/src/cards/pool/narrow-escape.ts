import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 26975.

export default defineCard({
  name: "Narrow Escape",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Return target permanent you control to its owner's hand. You gain 4 life.",
  targets: [{ kind: "permanent", whose: "you", filter: {} }],
  effect: {
    kind: "sequence",
    effects: [{ kind: "return-to-hand", target: 0 }, { kind: "gain-life", amount: 4 }],
  },
});
