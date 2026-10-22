import { defineCard } from "../define.js";

// EDHREC rank 12656.
//
// Rulings:
//   If you discard zero cards, you will draw one card.

export default defineCard({
  name: "Into the Night",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "It becomes night. Discard any number of cards, then draw that many cards plus one.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "day-night", value: "night" },
      { kind: "discard", target: "you", amount: 0, anyNumber: true },
      { kind: "draw", amount: { sum: [{ thisWay: "discarded" }, 1] } },
    ],
  },
});
