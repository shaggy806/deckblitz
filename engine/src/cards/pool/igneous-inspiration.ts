import { defineCard } from "../define.js";

// EDHREC rank 25754.

export default defineCard({
  name: "Igneous Inspiration",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Igneous Inspiration deals 3 damage to any target.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
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
    ],
  },
});
