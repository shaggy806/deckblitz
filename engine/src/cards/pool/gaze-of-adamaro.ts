import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 20527. Storm Seeker's shape: a `damage` to a target
// player reads `{ cardsInHand: "each" }` as that player's hand.

export default defineCard({
  name: "Gaze of Adamaro",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Gaze of Adamaro deals damage to target player equal to the number of cards in that player's hand.",
  targets: ["player"],
  effect: { kind: "damage", target: 0, amount: { cardsInHand: "each" } },
});
