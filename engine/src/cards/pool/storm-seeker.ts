import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 20523.
//
// A `damage` to a target player reads `{ cardsInHand: "each" }` as that
// player's hand.

export default defineCard({
  name: "Storm Seeker",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Storm Seeker deals damage to target player equal to the number of cards in that player's hand.",
  targets: ["player"],
  effect: { kind: "damage", target: 0, amount: { cardsInHand: "each" } },
});
