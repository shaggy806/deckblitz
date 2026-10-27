import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 30363.
//
// Rulings:
//   - Domain abilities count the number of basic land types among lands you control, not how many
//     lands you control or how many of any type.

export default defineCard({
  name: "Exotic Disease",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Domain — Target player loses X life and you gain X life, where X is the number of basic land types among lands you control.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", target: 0, amount: { basicLandTypes: "you" } },
      { kind: "gain-life", amount: { basicLandTypes: "you" } },
    ],
  },
});
