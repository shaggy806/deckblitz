import { defineCard } from "../define.js";

// EDHREC rank 26923. Lord Windgrace's "if a land card is discarded this way",
// then Release the Ants' return of the resolving spell itself (rule 608.2n):
// it goes to its owner's hand instead of the graveyard.

export default defineCard({
  name: "Psychic Miasma",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards a card. If a land card is discarded this way, return Psychic Miasma to its owner's hand.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "discarded", filter: { type: "land" } },
        then: { kind: "return-to-hand", target: "source", from: "stack" },
      },
    ],
  },
});
