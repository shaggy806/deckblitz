import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 21196.

export default defineCard({
  name: "Due Respect",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Permanents enter tapped this turn.\nDraw a card.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "player-effect", duration: "end-of-turn", entersTapped: {} },
      { kind: "draw", amount: 1 },
    ],
  },
});
