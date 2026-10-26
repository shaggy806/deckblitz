import { defineCard } from "../define.js";

// EDHREC rank 16746.
//
// Rulings:
//   [2011-01-22] Archangel’s Light isn’t put into the graveyard until after its instructions are
//     followed. You won’t gain 2 life for it, and it won’t be shuffled into your library.
//   [2011-01-22] If you have no cards in your graveyard, you won’t gain any life, but you’ll still
//     shuffle your library.

export default defineCard({
  name: "Archangel's Light",
  manaCost: "{7}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You gain 2 life for each card in your graveyard, then shuffle your graveyard into your library.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: { product: [2, { graveyardSize: "you" }] } },
      { kind: "shuffle-graveyard-into-library", target: "you" },
    ],
  },
});
