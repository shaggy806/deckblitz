import { defineCard } from "../define.js";

// EDHREC rank 27467.
//
// The cards are revealed as it resolves (its ruling): a `look-and-choose`
// over the hand that moves nothing (`"reveal"`), read by the life gain as
// `{ thisWay: "revealed" }`.
const TEXT = "Reveal any number of white cards in your hand. You gain 2 life for each card revealed this way.";

export default defineCard({
  name: "Scent of Jasmine",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
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
});
