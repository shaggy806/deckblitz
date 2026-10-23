import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 19769.

export default defineCard({
  name: "Narset's Rebuke",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Narset's Rebuke deals 5 damage to target creature. Add {U}{R}{W}. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "add-mana", mana: { all: ["U", "R", "W"] }, amount: 1 },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
