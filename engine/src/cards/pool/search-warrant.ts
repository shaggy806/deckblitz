import { defineCard } from "../define.js";

export default defineCard({
  name: "Search Warrant",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Target player reveals their hand. You gain life equal to the number of cards in that player's hand.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: 0 },
      { kind: "gain-life", amount: { cardsInHand: { target: 0 } } },
    ],
  },
});
