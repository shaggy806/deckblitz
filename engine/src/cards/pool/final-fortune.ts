import { defineCard } from "../define.js";

// EDHREC rank 1533.
//
// The delayed ability is that turn's: set up as it begins, and gone with it if
// it's skipped, so nobody loses (the rulings). A second extra turn made after
// this one comes first, and this one's end step is still its own (the rulings;
// rule 500.7). An instant, so "this one" can be an opponent's turn.

const TEXT = "Take an extra turn after this one. At the beginning of that turn's end step, you lose the game.";

export default defineCard({
  name: "Final Fortune",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "take-extra-turn",
    thatTurn: {
      atEndStep: { effect: { kind: "lose-game" }, text: "At the beginning of that turn's end step, you lose the game." },
    },
  },
});
