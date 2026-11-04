import { defineCard } from "../define.js";

export default defineCard({
  name: "Khorvath's Fury",
  manaCost: "{4}{R}",
  types: ["sorcery"],
  text:
    "For each player, choose friend or foe. Each friend discards all cards from their hand, then draws that many cards plus one. Khorvath's Fury deals damage to each foe equal to the number of cards in their hand.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "vote", choose: true, who: "you", for: { options: ["friend", "foe"], about: "each-player" } },
      { kind: "discard-hand", who: "each-friend" },
      {
        kind: "draw",
        who: "each-friend",
        amount: { sum: [{ thisWay: "discarded", who: "each" }, 1] },
      },
      { kind: "damage", who: "each-foe", amount: { cardsInHand: "each" } },
    ],
  },
});
