import { defineCard } from "../define.js";

// EDHREC rank 6417.

export default defineCard({
  name: "Time Reversal",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each player shuffles their hand and graveyard into their library, then draws seven cards. Exile Time Reversal.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "shuffle-graveyard-into-library",
        target: "each-player",
        zones: ["hand", "graveyard"],
      },
      { kind: "draw", amount: 7, who: "each-player" },
    ],
  },
  exileOnResolve: true,
});
