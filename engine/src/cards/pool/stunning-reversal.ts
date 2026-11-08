import { defineCard } from "../define.js";

export default defineCard({
  name: "Stunning Reversal",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "The next time you would lose the game this turn, instead draw seven cards and your life total becomes 1.\nExile Stunning Reversal.",
  exileOnResolve: true,
  effect: {
    kind: "replacement-effect",
    duration: "end-of-turn",
    next: true,
    replacement: {
      event: "would-lose-game",
      who: "you",
      instead: {
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 7 },
            { kind: "set-life-total", who: "you", amount: 1 },
          ],
        },
      },
    },
  },
});
