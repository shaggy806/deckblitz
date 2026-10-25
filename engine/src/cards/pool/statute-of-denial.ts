import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 24515.
//
// Rulings:
//   [2014-07-18] Whether you control a blue creature is checked only when Statute of Denial
//     resolves. If you do, drawing and discarding a card is mandatory. You can’t choose to not do
//     it.

export default defineCard({
  name: "Statute of Denial",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If you control a blue creature, draw a card, then discard a card.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", colors: ["U"] }, atLeast: 1 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "discard", target: "you", amount: 1 },
          ],
        },
      },
    ],
  },
});
