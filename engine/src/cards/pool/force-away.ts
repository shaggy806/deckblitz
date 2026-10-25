import { defineCard } from "../define.js";

// EDHREC rank 20885. Khans of Tarkir.

export default defineCard({
  name: "Force Away",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand.\nFerocious — If you control a creature with power 4 or greater, you may draw a card. If you do, discard a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Draw a card, then discard a card?",
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1 },
              { kind: "discard", target: "you", amount: 1 },
            ],
          },
        },
      },
    ],
  },
});
