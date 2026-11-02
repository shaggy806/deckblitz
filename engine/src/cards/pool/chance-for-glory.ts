import { defineCard } from "../define.js";

// Guilds of Ravnica. No duration on the indestructible: it lasts for good,
// for the creatures you control as this resolves.
export default defineCard({
  name: "Chance for Glory",
  manaCost: "{1}{R}{W}",
  colors: ["R", "W"],
  types: ["instant"],
  text: "Creatures you control gain indestructible. Take an extra turn after this one. At the beginning of that turn's end step, you lose the game.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "indestructible",
        duration: "permanent",
      },
      {
        kind: "take-extra-turn",
        thatTurn: {
          atEndStep: { effect: { kind: "lose-game" }, text: "At the beginning of that turn's end step, you lose the game." },
        },
      },
    ],
  },
});
