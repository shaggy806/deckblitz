import { defineCard } from "../define.js";

// EDHREC rank 18536.
// Spider-Gwen, Free Spirit's trigger, word for word.
const TEXT = "Whenever this creature becomes tapped, you may discard a card. If you do, draw a card.";

export default defineCard({
  name: "Rescue Leopard",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 4,
  toughness: 2,
  text: TEXT,
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
      text: TEXT,
    },
  ],
});
