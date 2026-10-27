import { defineCard } from "../define.js";

export default defineCard({
  name: "Strongarm Tactics",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player discards a card. Then each player who didn't discard a creature card this way loses 4 life.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "each-player", amount: 1 },
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "conditional",
          condition: { kind: "this-way", what: "discarded", who: "that-player", filter: { type: "creature" }, atMost: 0 },
          then: { kind: "lose-life", amount: 4, who: "that-player" },
        },
      },
    ],
  },
});
