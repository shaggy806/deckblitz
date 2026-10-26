import { defineCard } from "../define.js";

// EDHREC rank 25821.

export default defineCard({
  name: "Heed the Mists",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Mill a card, then draw cards equal to the milled card's mana value.",
  targets: [],
  // Mindshrieker's "the milled card's mana value".
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 1 },
      { kind: "draw", amount: { thisWay: "milled", sumOf: "mana-value" } },
    ],
  },
});
