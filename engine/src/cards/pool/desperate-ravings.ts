import { defineCard } from "../define.js";

// EDHREC rank 15951.

export default defineCard({
  name: "Desperate Ravings",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  flashback: { cost: "{2}{U}" },
  text: "Draw two cards, then discard a card at random.\nFlashback {2}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      { kind: "discard", target: "you", amount: 1, random: true },
    ],
  },
});
