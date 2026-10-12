import { defineCard } from "../define.js";

export default defineCard({
  name: "Tweeze",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Tweeze deals 3 damage to any target. You may discard a card. If you do, draw a card.",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
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
    ],
  },
});
