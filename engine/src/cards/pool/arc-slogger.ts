import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 30299.

export default defineCard({
  name: "Arc-Slogger",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 5,
  text: "{R}, Exile the top ten cards of your library: This creature deals 2 damage to any target.",
  activated: [
    {
      cost: { mana: "{R}", tap: false, exileTop: 10 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{R}, Exile the top ten cards of your library: This creature deals 2 damage to any target.",
    },
  ],
});
