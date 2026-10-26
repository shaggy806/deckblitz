import { defineCard } from "../define.js";

// EDHREC rank 28937.

export default defineCard({
  name: "Presence of the Wise",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You gain 2 life for each card in your hand.",
  targets: [],
  // Gerrard's Wisdom's shape.
  effect: { kind: "gain-life", amount: { product: [2, { cardsInHand: "you" }] } },
});
