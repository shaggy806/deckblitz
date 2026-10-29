import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 3364.

export default defineCard({
  name: "O'aka, Traveling Merchant",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 2,
  text: "{T}, Remove a counter from a nonland permanent you control: Draw a card.",
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        removeCounter: { kind: "any", count: 1, from: { notTypes: ["land"] } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Remove a counter from a nonland permanent you control: Draw a card.",
    },
  ],
});
