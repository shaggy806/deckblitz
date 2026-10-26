import { defineCard } from "../define.js";

const FACES = ["Toil // Trouble", "Toil", "Trouble"];

// The right half of Toil // Trouble (see toil-trouble.ts).
export default defineCard({
  name: "Trouble",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Trouble deals damage to target player equal to the number of cards in that player's hand.\nFuse (You may cast one or both halves of this card from your hand.)",
  targets: ["player"],
  effect: { kind: "damage", target: 0, amount: { cardsInHand: "each" } },
  faces: FACES,
  split: true,
});
