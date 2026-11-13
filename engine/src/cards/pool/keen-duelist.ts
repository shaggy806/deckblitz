import { defineCard } from "../define.js";

// EDHREC rank 3191.
//
// "You and target opponent each reveal the top card of your library" is a
// `reveal-top` over `{ youAnd: { target: 0 } }`; the life loss is one
// simultaneous loss (rule 603.2c), each player's amount the cards the *other*
// revealed (`who: "each-other"`), {X} as 0 (rule 202.3e). Each revealed card
// is still on top of its library, so "put the card you revealed into your
// hand" takes that top card — a move, not a draw.

const TEXT =
  "At the beginning of your upkeep, you and target opponent each reveal the top card of your library. You each lose life equal to the mana value of the card revealed by the other player. You each put the card you revealed into your hand.";

export default defineCard({
  name: "Keen Duelist",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "reveal-top",
        who: { youAnd: { target: 0 } },
        then: {
          kind: "sequence",
          effects: [
            {
              kind: "lose-life",
              who: { youAnd: { target: 0 } },
              amount: { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "revealed", who: "each-other" } },
            },
            {
              kind: "for-each-player",
              who: { youAnd: { target: 0 } },
              effect: {
                kind: "look-and-choose",
                zone: "library",
                player: "that-player",
                count: 1,
                min: 1,
                max: 1,
                destination: "hand",
                leftover: "stay",
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
