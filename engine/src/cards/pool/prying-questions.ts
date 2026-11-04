import { defineCard } from "../define.js";

// Rulings:
//   Prying Questions can target an opponent who has no cards in hand. That player just loses 3 life.
const TEXT = "Target opponent loses 3 life and puts a card from their hand on top of their library.";

export default defineCard({
  name: "Prying Questions",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", amount: 3, target: 0 },
      {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          player: "that-player",
          min: 1,
          max: 1,
          destination: "library-top",
          leftover: "stay",
        },
      },
    ],
  },
});
