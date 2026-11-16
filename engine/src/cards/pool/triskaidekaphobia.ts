import { defineCard } from "../define.js";

// EDHREC rank 11071. Every player at exactly 13 loses at once, so all of them
// at 13 is a draw (rule 104.4a; the ruling); only then does each player still
// in the game gain or lose 1 life, so an opponent at 13 loses before you at 1
// would (the ruling). The mode is chosen even when nobody is at 13.

const TEXT =
  "At the beginning of your upkeep, choose one —\n• Each player with exactly 13 life loses the game, then each player gains 1 life.\n• Each player with exactly 13 life loses the game, then each player loses 1 life.";

const AT_13 = { kind: "lose-game", who: "each-player", whoseIf: { kind: "life-total", who: "that-player", atLeast: 13, atMost: 13 } } as const;

export default defineCard({
  name: "Triskaidekaphobia",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Each player with exactly 13 life loses the game, then each player gains 1 life.",
            effect: { kind: "sequence", effects: [AT_13, { kind: "gain-life", amount: 1, who: "each-player" }] },
          },
          {
            text: "Each player with exactly 13 life loses the game, then each player loses 1 life.",
            effect: { kind: "sequence", effects: [AT_13, { kind: "lose-life", amount: 1, who: "each-player" }] },
          },
        ],
      },
      resolve: null,
      text: "At the beginning of your upkeep, choose one —",
    },
  ],
});
