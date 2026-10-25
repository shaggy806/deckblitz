import { defineCard } from "../define.js";

// EDHREC rank 14253.
// Ruling: if you control an artifact as it resolves, you can't discard a card.

export default defineCard({
  name: "Artificer's Epiphany",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw two cards. If you control no artifacts, discard a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "conditional",
        condition: { kind: "not", of: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 } },
        then: { kind: "discard", target: "you", amount: 1 },
      },
    ],
  },
});
