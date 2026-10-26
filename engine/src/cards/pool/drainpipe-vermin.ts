import { defineCard } from "../define.js";

// EDHREC rank 13352. Return to Ravnica.
//
// Rulings:
//   You may pay {B} only once. The target player will discard a maximum of one card.

const TEXT = "When this creature dies, you may pay {B}. If you do, target player discards a card.";

export default defineCard({
  name: "Drainpipe Vermin",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["player"],
      effect: {
        kind: "may",
        prompt: "Pay {B} to have that player discard a card?",
        cost: "{B}",
        effect: { kind: "discard", target: 0, amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
