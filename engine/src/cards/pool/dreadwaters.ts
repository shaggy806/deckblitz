import { defineCard } from "../define.js";

// EDHREC rank 17668.
//
// Rulings:
//   [2012-05-01] The number of cards put into the graveyard is based on the number of lands you
//     control when Dreadwaters resolves.

export default defineCard({
  name: "Dreadwaters",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player mills X cards, where X is the number of lands you control.",
  targets: ["player"],
  effect: { kind: "mill", target: 0, amount: { countOf: { type: "land", controlledBy: "you" } } },
});
