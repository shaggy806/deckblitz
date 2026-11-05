import { defineCard } from "../define.js";

// EDHREC rank 4496.

export default defineCard({
  name: "Last Chance",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Take an extra turn after this one. At the beginning of that turn's end step, you lose the game.",
  effect: {
    kind: "take-extra-turn",
    thatTurn: {
      atEndStep: {
        effect: { kind: "lose-game" },
        text: "At the beginning of that turn's end step, you lose the game.",
      },
    },
  },
});
