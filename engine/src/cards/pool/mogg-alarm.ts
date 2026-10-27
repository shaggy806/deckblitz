import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 19171.
// Makes Goblin → use "Goblin Token".

export default defineCard({
  name: "Mogg Alarm",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "land", subtype: "Mountain" }, count: 2, text: "two Mountains" },
  },
  text: "You may sacrifice two Mountains rather than pay this spell's mana cost.\nCreate two 1/1 red Goblin creature tokens.",
  effect: { kind: "create-token", token: "Goblin Token", count: 2 },
});
