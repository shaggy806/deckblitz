import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 31219.

export default defineCard({
  name: "Jasmine Seer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: "{2}{W}, {T}: Reveal any number of white cards in your hand. You gain 2 life for each card revealed this way.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: { cardsInHand: "you" },
            filter: { colors: ["W"] },
            destination: "reveal",
            leftover: "stay",
          },
          { kind: "gain-life", amount: { product: [2, { thisWay: "revealed", who: "you" }] } },
        ],
      },
      resolve: null,
      text: "{2}{W}, {T}: Reveal any number of white cards in your hand. You gain 2 life for each card revealed this way.",
    },
  ],
});
