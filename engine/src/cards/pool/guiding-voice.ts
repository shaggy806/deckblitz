import { defineCard } from "../define.js";

// EDHREC rank 23977.

export default defineCard({
  name: "Guiding Voice",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on target creature.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
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
