import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 27583. Lifecrafter's Bestiary's
// optional payment, looting instead of drawing.

const TEXT = "Whenever you cast a creature spell, you may pay {1}. If you do, draw a card, then discard a card.";

export default defineCard({
  name: "Customs Depot",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to draw a card, then discard a card?",
        cost: "{1}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "discard", target: "you", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
