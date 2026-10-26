import { defineCard } from "../define.js";

export default defineCard({
  name: "Gerrard's Wisdom",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You gain 2 life for each card in your hand.",
  effect: { kind: "gain-life", amount: { product: [2, { cardsInHand: "you" }] } },
});
