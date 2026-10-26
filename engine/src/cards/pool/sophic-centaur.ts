import { defineCard } from "../define.js";

// EDHREC rank 31030.

export default defineCard({
  name: "Sophic Centaur",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: "{2}{G}{G}, {T}, Discard a card: You gain 2 life for each card in your hand.",
  activated: [
    {
      cost: { mana: "{2}{G}{G}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "gain-life", amount: { product: [2, { cardsInHand: "you" }] } },
      resolve: null,
      text: "{2}{G}{G}, {T}, Discard a card: You gain 2 life for each card in your hand.",
    },
  ],
});
