import { defineCard } from "../define.js";

// EDHREC rank 11004.
//
// Rulings:
//   [2022-12-08] When you cycle this card, first the cycling ability goes on the stack, then the
//     triggered ability goes on the stack on top of it. The triggered ability will resolve before
//     you draw a card from the cycling ability.
//   [2022-12-08] The cycling ability and the triggered ability are separate.

const CYCLE_TEXT =
  "When you cycle this card, you may search your library for a basic land card, reveal that card, put it into your hand, then shuffle.";

export default defineCard({
  name: "Krosan Tusker",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar", "Beast"],
  power: 6,
  toughness: 5,
  cycling: { cost: "{2}{G}" },
  text: `Cycling {2}{G} ({2}{G}, Discard this card: Draw a card.)\n${CYCLE_TEXT} (Do this before you draw.)`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: CYCLE_TEXT,
    },
  ],
});
