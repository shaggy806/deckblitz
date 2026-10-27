import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 15504.
// One trigger per damage event, whatever the amount (the rulings); the
// intervening "if untapped" is checked as it triggers and as it resolves.

const TEXT =
  "Whenever a source an opponent controls deals damage to you, if this artifact is untapped, you may draw a card.";

export default defineCard({
  name: "Farsight Mask",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "opponent", to: "you" },
      condition: { kind: "source", filter: { tapped: false } },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
