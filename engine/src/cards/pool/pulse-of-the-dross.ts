import { defineCard } from "../define.js";

export default defineCard({
  name: "Pulse of the Dross",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals three cards from their hand and you choose one of them. That player discards that card. Then if that player has more cards in hand than you, return Pulse of the Dross to its owner's hand.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard-chosen", target: 0, reveals: 3 },
      {
        kind: "conditional",
        condition: { kind: "player-compare", stat: "hand", compare: "fewer", than: { target: 0 } },
        then: { kind: "return-to-hand", target: "source", from: "stack" },
      },
    ],
  },
});
