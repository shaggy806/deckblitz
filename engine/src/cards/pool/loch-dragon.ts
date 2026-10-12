import { defineCard } from "../define.js";

export default defineCard({
  name: "Loch Dragon",
  manaCost: "{U/R}{U/R}{U/R}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature enters or attacks, you may discard a card. If you do, draw a card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: "Whenever this creature enters or attacks, you may discard a card. If you do, draw a card.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: "Whenever this creature enters or attacks, you may discard a card. If you do, draw a card.",
    },
  ],
});
