import { defineCard } from "../define.js";

// Portal Three Kingdoms.
export default defineCard({
  name: "Warrior's Oath",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Take an extra turn after this one. At the beginning of that turn's end step, you lose the game.",
  targets: [],
  effect: {
    kind: "take-extra-turn",
    thatTurn: {
      atEndStep: { effect: { kind: "lose-game" }, text: "At the beginning of that turn's end step, you lose the game." },
    },
  },
});
