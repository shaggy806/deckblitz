import { defineCard } from "../define.js";

// Modern Horizons 2 (MH2). EDHREC rank 22310. "If you've discarded a card
// this turn" is asked as it resolves: the turn history's `discarded` list.

export default defineCard({
  name: "Recalibrate",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. If you've discarded a card this turn, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "turn-history", what: "discarded" },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
