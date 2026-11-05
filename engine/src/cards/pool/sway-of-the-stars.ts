import { defineCard } from "../define.js";

// EDHREC rank 17751.

export default defineCard({
  name: "Sway of the Stars",
  manaCost: "{8}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each player shuffles their hand, graveyard, and all permanents they own into their library, then draws seven cards. Each player's life total becomes 7.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          {
            kind: "shuffle-graveyard-into-library",
            target: "each-player",
            zones: ["hand", "graveyard", "permanents"],
          },
          { kind: "draw", amount: 7, who: "each-player" },
        ],
      },
      { kind: "set-life-total", who: "each-player", amount: 7 },
    ],
  },
});
