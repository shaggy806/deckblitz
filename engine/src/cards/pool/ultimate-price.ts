import { defineCard } from "../define.js";

// EDHREC rank 14943.
//
// Rulings:
//   [2024-01-12] A monocolored creature is exactly one color. Colorless creatures aren't
//     monocolored.
//
// Sultai Charm's monocolored filter: not multicolored, and at least one colour.

export default defineCard({
  name: "Ultimate Price",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target monocolored creature.",
  targets: [
    {
      kind: "permanent",
      filter: {
        type: "creature",
        multicolored: false,
        anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }],
      },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
