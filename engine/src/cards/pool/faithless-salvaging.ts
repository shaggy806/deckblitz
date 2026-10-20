import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2). With no card in hand it still draws (the ruling):
// the discard simply finds nothing.
export default defineCard({
  name: "Faithless Salvaging",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  rebound: true,
  text: "Discard a card, then draw a card.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
