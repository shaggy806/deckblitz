import { defineCard } from "../define.js";

export default defineCard({
  name: "Burning-Tree Vandal",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["riot"],
  text: "Riot (This creature enters with your choice of a +1/+1 counter or haste.)\nWhenever this creature attacks, you may discard a card. If you do, draw a card.",
  triggered: [
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
      text: "Whenever this creature attacks, you may discard a card. If you do, draw a card.",
    },
  ],
});
