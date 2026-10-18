import { defineCard } from "../define.js";

// EDHREC rank 10669.

const CORRUPTED_TEXT = "Corrupted — Each opponent who has three or more poison counters loses 3 life.";

export default defineCard({
  name: "Feed the Infection",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `You draw three cards and you lose 3 life.\n${CORRUPTED_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "lose-life", amount: 3 },
      {
        // Each opponent's poison counters are read as the spell resolves.
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "conditional",
          condition: { kind: "player-counters", counter: "poison", who: "that-player", atLeast: 3 },
          then: { kind: "lose-life", amount: 3, who: "that-player" },
        },
      },
    ],
  },
});
