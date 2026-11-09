import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 7273.

export default defineCard({
  name: "Bog Witch",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: "{B}, {T}, Discard a card: Add {B}{B}{B}.",
  activated: [
    {
      cost: { mana: "{B}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 3 },
      resolve: null,
      text: "{B}, {T}, Discard a card: Add {B}{B}{B}.",
    },
  ],
});
