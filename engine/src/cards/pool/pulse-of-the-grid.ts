import { defineCard } from "../define.js";

// EDHREC rank 16713.

export default defineCard({
  name: "Pulse of the Grid",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw two cards, then discard a card. Then if an opponent has more cards in hand than you, return Pulse of the Grid to its owner's hand.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 2 }, { kind: "discard", target: "you", amount: 1 }],
      },
      {
        kind: "conditional",
        condition: { kind: "player-compare", stat: "hand", compare: "fewer", than: "an-opponent" },
        then: { kind: "return-to-hand", target: "source", from: "stack" },
      },
    ],
  },
});
