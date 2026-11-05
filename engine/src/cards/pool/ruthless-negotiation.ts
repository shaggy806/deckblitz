import { defineCard } from "../define.js";

// EDHREC rank 18758.

export default defineCard({
  name: "Ruthless Negotiation",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  flashback: { cost: "{4}{B}" },
  text: "Target opponent exiles a card from their hand. If this spell was cast from a graveyard, draw a card.\nFlashback {4}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 1,
          max: 1,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { castFrom: "graveyard" } },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
