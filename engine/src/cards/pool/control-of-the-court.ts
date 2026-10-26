import { defineCard } from "../define.js";

export default defineCard({
  name: "Control of the Court",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  targets: [],
  text: "Draw four cards, then discard three cards at random.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 4 },
      { kind: "discard", target: "you", amount: 3, random: true },
    ],
  },
});
