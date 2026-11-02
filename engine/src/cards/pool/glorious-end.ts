import { defineCard } from "../define.js";

// Rule 724.1. The end step this turn is skipped, so "your next end step" is a
// later one of yours (the rulings); ending that turn before its end step only
// puts it off, and once it has triggered it's gone however it leaves the stack.
export default defineCard({
  name: "Glorious End",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: `End the turn. (Exile all spells and abilities from the stack, including this card. The player whose turn it is discards down to their maximum hand size. Damage wears off, and "this turn" and "until end of turn" effects end.)\nAt the beginning of your next end step, you lose the game.`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "end-the-turn" },
      {
        kind: "delayed-trigger",
        at: "your-next-end-step",
        effect: { kind: "lose-game" },
        text: "At the beginning of your next end step, you lose the game.",
      },
    ],
  },
});
