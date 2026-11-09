import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 2906.

export default defineCard({
  name: "Skirge Familiar",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Imp"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nDiscard a card: Add {B}.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "Discard a card: Add {B}.",
    },
  ],
});
