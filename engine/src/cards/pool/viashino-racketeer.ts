import { defineCard } from "../define.js";

export default defineCard({
  name: "Viashino Racketeer",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Rogue"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, you may discard a card. If you do, draw a card.",
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
      text: "When this creature enters, you may discard a card. If you do, draw a card.",
    },
  ],
});
