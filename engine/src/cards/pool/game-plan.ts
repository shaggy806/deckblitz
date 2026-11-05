import { defineCard } from "../define.js";

// EDHREC rank 10926.

export default defineCard({
  name: "Game Plan",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["sorcery"],
  assist: true,
  text: "Assist (Another player can pay up to {5} of this spell's cost.)\nEach player shuffles their hand and graveyard into their library, then draws seven cards. Exile Game Plan.",
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
