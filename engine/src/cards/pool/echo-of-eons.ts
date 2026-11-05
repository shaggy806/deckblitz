import { defineCard } from "../define.js";

// EDHREC rank 2607.

export default defineCard({
  name: "Echo of Eons",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{2}{U}" },
  text: "Each player shuffles their hand and graveyard into their library, then draws seven cards.\nFlashback {2}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
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
});
