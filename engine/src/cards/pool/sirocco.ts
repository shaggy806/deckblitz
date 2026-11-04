import { defineCard } from "../define.js";

// Rulings:
//   [2014-02-01] If you target yourself with this spell, you must reveal your entire hand to the
//     other players just as any other player would.

export default defineCard({
  name: "Sirocco",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target player reveals their hand. For each blue instant card revealed this way, that player discards that card unless they pay 4 life.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-hand", who: 0 },
      {
        kind: "for-each-unless",
        of: { inHandOf: 0, filter: { type: "instant", colors: ["U"] } },
        asks: { target: 0 },
        as: 1,
        options: [{ payLife: 4, text: "Pay 4 life to keep {it}" }],
        otherwise: { kind: "discard-card", target: 1 },
      },
    ],
  },
});
