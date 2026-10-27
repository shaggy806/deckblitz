import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 6142.

export default defineCard({
  name: "Gush",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["instant"],
  alternativeCost: {
    mana: "{0}",
    returnToHand: { filter: { type: "land", subtype: "Island" }, count: 2, text: "two Islands you control" },
  },
  text: "You may return two Islands you control to their owner's hand rather than pay this spell's mana cost.\nDraw two cards.",
  effect: { kind: "draw", amount: 2 },
});
