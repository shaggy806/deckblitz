import { defineCard } from "../define.js";

// EDHREC rank 14993.
//
// Clash (rule 701.30): the `clash` effect after the destroy; the toughness is
// the destroyed creature's as it last existed (rule 608.2h).

export default defineCard({
  name: "Weed Strangle",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. Clash with an opponent. If you win, you gain life equal to that creature's toughness. (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "clash", won: { kind: "gain-life", amount: { toughnessOf: 0 } } },
    ],
  },
});
