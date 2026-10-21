import { defineCard } from "../define.js";

// EDHREC rank 17708.
//
// Rulings:
//   You surveil 1 even if the opponent doesn't discard a card, perhaps because
//   they had no cards in hand at all.

export default defineCard({
  name: "Thought Erasure",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card.\nSurveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      { kind: "surveil", amount: 1 },
    ],
  },
});
