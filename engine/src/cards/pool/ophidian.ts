import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 26753.

export default defineCard({
  name: "Ophidian",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 3,
  text: "Whenever this creature attacks and isn't blocked, you may draw a card. If you do, this creature assigns no combat damage this turn.",
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "assigns-no-combat-damage", target: "source" },
      },
      resolve: null,
      text: "Whenever this creature attacks and isn't blocked, you may draw a card. If you do, this creature assigns no combat damage this turn.",
    },
  ],
});
