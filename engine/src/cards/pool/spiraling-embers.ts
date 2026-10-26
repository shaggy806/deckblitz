import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 20834.

export default defineCard({
  name: "Spiraling Embers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Spiraling Embers deals damage to any target equal to the number of cards in your hand.",
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: { cardsInHand: "you" } },
});
