import { defineCard } from "../define.js";

// EDHREC rank 11514. Commander Legends (CMR). The hand is counted as the end
// step trigger resolves.

export default defineCard({
  name: "Demonic Lore",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "When this enchantment enters, draw three cards.\nAt the beginning of your end step, you lose 2 life for each card in your hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 3 },
      resolve: null,
      text: "When this enchantment enters, draw three cards.",
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: { product: [2, { cardsInHand: "you" }] } },
      resolve: null,
      text: "At the beginning of your end step, you lose 2 life for each card in your hand.",
    },
  ],
});
