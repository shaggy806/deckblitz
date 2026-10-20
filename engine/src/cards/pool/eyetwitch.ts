import { defineCard } from "../define.js";

// EDHREC rank 15806.

export default defineCard({
  name: "Eyetwitch",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Eye", "Bat"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Learn: discard a card to draw a card?",
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
      text: "When this creature dies, learn.",
    },
  ],
});
