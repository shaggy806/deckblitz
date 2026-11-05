import { defineCard } from "../define.js";

// "Cards you've discarded this turn" counts the one just discarded and any
// before it — the jump-start discard too (the rulings).
export default defineCard({
  name: "Dihada's Ploy",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text:
    "Draw two cards, then discard a card. You gain life equal to the number of cards you've discarded this turn.\n" +
    "Jump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "discard", target: "you", amount: 1 },
      { kind: "gain-life", amount: { turnHistory: "discarded" } },
    ],
  },
  flashback: { cost: "{1}{U}{B}", discard: 1, keyword: "jump-start" },
});
