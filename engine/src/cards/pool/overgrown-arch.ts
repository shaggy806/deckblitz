import { defineCard } from "../define.js";

// EDHREC rank 20214.

export default defineCard({
  name: "Overgrown Arch",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender"],
  text: "Defender\n{T}: You gain 1 life.\n{2}, Sacrifice this creature: Learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "{T}: You gain 1 life.",
    },
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
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
      text: "{2}, Sacrifice this creature: Learn.",
    },
  ],
});
