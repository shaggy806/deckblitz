import { defineCard } from "../define.js";

// EDHREC rank 26382.
//
// Steal the Show's shape with a fixed two: the draw reads how many were
// actually discarded, so a player with one card discards and draws one.

export default defineCard({
  name: "Forget",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Target player discards two cards, then draws as many cards as they discarded this way.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: 0, amount: 2 },
      { kind: "draw", target: 0, amount: { thisWay: "discarded" } },
    ],
  },
});
