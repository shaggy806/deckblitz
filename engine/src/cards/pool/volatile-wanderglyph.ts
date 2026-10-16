import { defineCard } from "../define.js";

// EDHREC rank 16827.

export default defineCard({
  name: "Volatile Wanderglyph",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature becomes tapped, you may discard a card. If you do, draw a card.",
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to draw a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: "Whenever this creature becomes tapped, you may discard a card. If you do, draw a card.",
    },
  ],
});
